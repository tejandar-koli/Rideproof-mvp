(function(){
var C=window.RIDEPROOF_CONFIG||{},app=document.getElementById("app"),sb,me=null,tab="main",mode="in",loadedUserId=null;
var EXT={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function val(id){var e=document.getElementById(id);return e?e.value.trim():""}
function say(m){var t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},3000)}
function done(p,ok){return p.then(function(r){if(r.error){say(r.error.message)}else{if(ok)say(ok);render()}})}
function fmt(d){return new Date(d).toLocaleString()}
function nowLocal(){var d=new Date(),p=function(n){return String(n).padStart(2,"0")};return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes())}
function badge(s){return s=== "pending"?' <span class="badge wait">Waiting for rider response</span>':s=== "responded"?' <span class="badge wait">Under review</span>':' <span class="badge ok">Reviewed</span>'}
function tabs(list){return'<div class="tabs">'+list.map(function(t){return'<button class="'+(tab===t[0]?"on":"")+'" data-a="tab" data-t="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>'}
function viewBtn(p,l){return p?'<button class="ghost" data-a="view" data-p="'+esc(p)+'">'+l+'</button>':""}

if(!C.SUPABASE_URL||/YOUR_/.test(C.SUPABASE_URL)||!C.SUPABASE_KEY||/YOUR_/.test(C.SUPABASE_KEY)){
  app.innerHTML='<h1>RideProof</h1><div class="card"><h2>Setup needed</h2><p>Open config.js and paste your Supabase Project URL and Publishable key, then reload.</p></div>';return}
sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY);
sb.auth.onAuthStateChange(function(_e,s){setTimeout(function(){
  if(!s){me=null;loadedUserId=null;render();return}
  if(loadedUserId===s.user.id)return;
  loadedUserId=s.user.id;
  sb.from("profiles").select("*").eq("id",s.user.id).single().then(function(r){
    if(r.error){say(r.error.message);return}
    me=r.data;
    render()
  })
},0)});

function authView(){var up=mode=== "up";
return'<h1>RideProof</h1><p class="tag">Proof first. Then fair decisions.</p><div class="card"><h2>'+ (up? "Create your account": "Log in")+'</h2>'+
(up?'<label for="nm">Full name</label><input id="nm" autocomplete="name" maxlength="80">':"")+
'<label for="em">Email address</label><input id="em" type="email" autocomplete="email"><label for="pw">Password</label><input id="pw" type="password" minlength="8" autocomplete="'+(up?"new-password":"current-password")+'"><button data-a="'+(up? "signup": "signin")+'">'+(up? "Create account": "Log in")+'</button><button class="ghost" data-a="mode">'+(up?"Already registered? Log in":"New rider? Create an account")+'</button></div>'+
'<p class="note">Use fictional names and data only. New accounts are riders.</p>'}

function head(){return'<h1>RideProof</h1><p class="tag">'+esc(me.full_name)+' · '+me.role+'</p>'}
function foot(){return'<button class="ghost" data-a="refresh">Refresh</button><button class="ghost" data-a="out">Sign out</button>'}

function riderView(D){var h=head()+tabs([["main","Deliveries"],["hist","History"],["cases","Complaints"]]),any=0;
if(tab=== "main") {D.orders.forEach(function(o){
 if(o.status=== "assigned"){any=1;h+='<div class="card"><h2>New order '+esc(o.code)+'</h2><p>Pickup: '+esc(o.pickup)+'<br>Drop-off: '+esc(o.dropoff)+'</p><button data-a="accept" data-id="'+o.id+'">Accept order</button></div>'}
 if(o.status=== "accepted"){any=1;h+='<div class="card"><h2>Submit proof for '+esc(o.code)+'</h2><label for="ph'+o.id+'">Delivery photo (JPG, PNG or WEBP, max 5 MB)</label><input id="ph'+o.id+'" type="file" accept="image/jpeg,image/png,image/webp"><label for="tm'+o.id+'">Delivery time</label><input id="tm'+o.id+'" type="datetime-local" value="'+nowLocal()+'"><label for="lc'+o.id+'">Location label</label><input id="lc'+o.id+'" maxlength="80"><button data-a="proof" data-id="'+o.id+'">Submit proof</button></div>'}});
 if(!any)h+='<div class="card"><p>No active deliveries. When a reviewer assigns one, tap Refresh.</p></div>'}
if(tab=== "hist") {D.orders.filter(function(o){return o.status=== "delivered"}).forEach(function(o){var p=D.proofs[o.id];any=1;
 h+='<div class="card"><h2>'+esc(o.code)+'</h2><span class="badge ok">Proof recorded</span><p>Time: '+fmt(p.delivered_at)+'<br>Location: '+esc(p.location_label||"Not given")+'</p>'+viewBtn(p.file_path,"View my photo")+'</div>'});
 if(!any)h+='<div class="card"><p>No completed deliveries yet.</p></div>'}
if(tab=== "cases") {D.orders.forEach(function(o){var x=D.cx[o.id];if(!x)return;any=1;
 h+='<div class="card"><h2>Complaint for '+esc(o.code)+'</h2>'+badge(x.status)+'<p style="margin-top:8px">'+esc(x.body)+'</p>';
 if(x.status=== "pending")h+='<label for="rs'+x.id+'">Explain your side</label><textarea id="rs'+x.id+'" rows="4" maxlength="600"></textarea><label for="ev'+x.id+'">Supporting evidence (optional, max 5 MB)</label><input id="ev'+x.id+'" type="file" accept="image/*,application/pdf"><button data-a="respond" data-id="'+x.id+'">Submit response</button>';
 else{h+='<p class="tag">Your response: '+esc(x.response)+'</p>';
  if(x.status=== "reviewed")h+='<p><b>Assessment:</b> '+esc(x.assessment)+'<br><b>Reason:</b> '+esc(x.reason)+'</p>';else h+='<p class="tag">A decision has not yet been recorded.</p>'}
 h+='</div>'});
 if(!any)h+='<div class="card"><p>No complaints. If one is raised it appears here after Refresh – no second login.</p></div>'}
return h+foot()}

function reviewerView(D){var h=head()+tabs([["main","Orders"],["cases","Cases"]]),any=0,names={};
D.riders.forEach(function(r){names[r.id]=r.full_name});
if(tab=== "main") {
 h+='<div class="card"><h2>Assign a sample order</h2><label for="rd">Rider</label><select id="rd">'+D.riders.map(function(r){return'<option value="'+r.id+'">'+esc(r.full_name)+'</option>'}).join("")+'</select><button data-a="assign">Assign order</button></div>';
 D.orders.forEach(function(o){h+='<div class="card"><h2>'+esc(o.code)+'</h2><span class="badge">'+o.status+'</span><p class="tag">Rider: '+esc(names[o.rider_id]||"")+'</p>'+
  (o.status=== "delivered"&&!D.cx[o.id]?'<label for="cb'+o.id+'">Simulated complaint</label><input id="cb'+o.id+'" value="Customer reports order not received." maxlength="500"><button class="ghost" data-a="complain" data-id="'+o.id+'">Create complaint</button>':"")+'</div>'})}
else{D.orders.forEach(function(o){var x=D.cx[o.id],p=D.proofs[o.id];if(!x)return;any=1;
 h+='<div class="card"><h2>'+esc(o.code)+'</h2>'+badge(x.status)+'<p style="margin-top:8px">Rider: '+esc(names[o.rider_id]||"")+'<br>Proof: '+fmt(p.delivered_at)+' · '+esc(p.location_label||"no label")+'<br>Complaint: '+esc(x.body)+'<br>Response: '+esc(x.response||"Not yet received")+'</p>'+viewBtn(p.file_path,"View proof photo")+viewBtn(x.evidence_path,"View rider evidence");
 if(x.status=== "responded")h+='<label for="as'+x.id+'">Assessment</label><select id="as'+x.id+'"><option>Proof supports rider’s account</option><option>Proof inconclusive</option><option>More evidence needed</option></select><label for="rn'+x.id+'">Reason</label><textarea id="rn'+x.id+'" rows="3" maxlength="400"></textarea><button data-a="review" data-id="'+x.id+'">Record review</button>';
 if(x.status=== "reviewed")h+='<p><b>'+esc(x.assessment)+'</b><br>'+esc(x.reason)+'</p>';h+='</div>'});
 if(!any)h+='<div class="card"><p>No cases yet.</p></div>'}
return h+foot()}

function render(){
 if(!me){app.innerHTML=authView();return}
 var q=[sb.from("orders").select("*").order("created_at",{ascending:false}),sb.from("proofs").select("*"),sb.from("complaints").select("*")];
 if(me.role=== "reviewer")q.push(sb.from("profiles").select("id,full_name").eq("role","rider"));
 Promise.all(q).then(function(r){
  for(var i=0;i<r.length;i++)if(r[i].error){say(r[i].error.message);return}
  var D={orders:r[0].data,proofs:{},cx:{},riders:r[3]?r[3].data:[]};
  r[1].data.forEach(function(p){D.proofs[p.order_id]=p});r[2].data.forEach(function(c){D.cx[c.order_id]=c});
  app.innerHTML=me.role=== "reviewer"?reviewerView(D):riderView(D)})}

function upload(file,name){if(file.size>5*1024*1024)return Promise.resolve({error:{message:"File is over 5 MB"}});
 var path=me.id+"/"+name+"-"+Date.now()+"."+(EXT[file.type]||file.name.split(".").pop().replace(/[^a-z0-9]/gi,"").slice(0,5)||"bin");
 return sb.storage.from("proofs").upload(path,file,{contentType:file.type}).then(function(r){return r.error?r:{path:path}})}

document.addEventListener("click",function(e){var b=e.target.closest("[data-a]");if(!b)return;var A=b.dataset.a,id=b.dataset.id;
 if(A=== "mode") {mode=mode=== "in"?"up":"in";render()}
 else if(A=== "signin")done(sb.auth.signInWithPassword({email:val("em"),password:val("pw")}));
 else if(A=== "signup")sb.auth.signUp({email:val("em"),password:val("pw"),options:{data:{full_name:val("nm")}}}).then(function(r){
  if(r.error)say(r.error.message);else if(!r.data.session)say("Check your email to confirm, then log in.")});
 else if(A=== "out")sb.auth.signOut();
 else if(A=== "tab") {tab=b.dataset.t;render()}
 else if(A=== "refresh") {render();say("Refreshed")}
 else if(A=== "accept")done(sb.rpc("accept_order",{p_order:id}),"Order accepted");
 else if(A=== "proof") {var f=document.getElementById("ph"+id).files[0];
  if(!f||!EXT[f.type]){say("Choose a JPG, PNG or WEBP photo");return}
  upload(f,id).then(function(u){if(u.error){say(u.error.message);return}
   done(sb.rpc("submit_proof",{p_order:id,p_path:u.path,p_time:new Date(val("tm"+id)).toISOString(),p_loc:val("lc"+id)}),"Proof recorded")})}
 else if(A=== "respond") {var t=val("rs"+id);if(!t){say("Write your explanation first");return}
  var ef=document.getElementById("ev"+id).files[0];
  (ef?upload(ef,"evidence"):Promise.resolve({path:null})).then(function(u){if(u.error){say(u.error.message);return}
   done(sb.rpc("submit_response",{p_id:id,p_resp:t,p_path:u.path}),"Response submitted")})}
 else if(A=== "assign") {if(!val("rd")){say("No riders registered yet");return}done(sb.rpc("assign_order",{p_rider:val("rd")}),"Order assigned")}
 else if(A=== "complain")done(sb.rpc("create_complaint",{p_order:id,p_body:val("cb"+id)||"Customer reports order not received."}),"Complaint created");
 else if(A=== "review") {var r=val("rn"+id);if(!r){say("Add a reason");return}done(sb.rpc("record_review",{p_id:id,p_assess:val("as"+id),p_reason:r}),"Review recorded")}
 else if(A=== "view") {var w=window.open("","_blank");sb.storage.from("proofs").createSignedUrl(b.dataset.p,300).then(function(r){
  if(r.error){if(w)w.close();say(r.error.message)}else if(w)w.location=r.data.signedUrl;else window.location=r.data.signedUrl})}});

setInterval(function(){var a=document.activeElement;if(me&&!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)))render()},10000);
})();
