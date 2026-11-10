document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');
 if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰'}))}
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const catalogGrid=document.querySelector('.catalog-grid');
 const catalogSearch=document.querySelector('#catalog-search');
 const filterButtons=[...document.querySelectorAll('[data-filter]')];
 const catalogCards=catalogGrid?[...catalogGrid.querySelectorAll('.catalog-card[data-category]')]:[];
 if(catalogSearch&&catalogGrid&&catalogCards.length){
  const isExperiencePage=window.location.pathname.endsWith('/experiences.html');
  const filterParam='style';
  let selectedFilter='all';
  let emptyState=catalogGrid.querySelector('.catalog-empty-state');
  if(!emptyState){emptyState=document.createElement('div');emptyState.className='empty-state catalog-empty-state';emptyState.setAttribute('role','status');emptyState.setAttribute('aria-live','polite');emptyState.textContent=isExperiencePage?'No experiences match your search. Try another keyword or clear the filters.':'No destinations match your search. Try another place or clear the filters.';catalogGrid.appendChild(emptyState)}
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim();
  const updateCatalogUrl=()=>{
   const params=new URLSearchParams(window.location.search),term=catalogSearch.value.trim();
   if(term)params.set('q',term);else params.delete('q');
   if(selectedFilter!=='all')params.set(filterParam,selectedFilter);else params.delete(filterParam);
   const query=params.toString(),next=window.location.pathname+(query?'?'+query:'')+(isExperiencePage?'':'#discover');
   window.history.replaceState({},'',next);
  };
  const applyCatalogFilters=({syncUrl=true}={})=>{
   const terms=normalize(catalogSearch.value).split(/\\s+/).filter(Boolean);let count=0;
   catalogCards.forEach(card=>{
    const categories=(card.dataset.category||'').split('|').map(x=>x.trim());
    const categoryMatch=selectedFilter==='all'||categories.includes(selectedFilter);
    const haystack=normalize([card.dataset.searchable,card.textContent,card.dataset.category].join(' '));
    const searchMatch=terms.every(term=>haystack.includes(term));
    card.hidden=!(categoryMatch&&searchMatch);if(!card.hidden)count++;
   });
   emptyState.hidden=count!==0;
   const status=document.querySelector('[data-search-status]');
   if(status)status.textContent=count+' '+(isExperiencePage?'experience':'destination')+(count===1?'':'s')+' found';
   filterButtons.forEach(button=>{const active=(button.dataset.filter||'all')===selectedFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
   if(syncUrl)updateCatalogUrl();
  };
  const restoreCatalogState=()=>{
   const params=new URLSearchParams(window.location.search),allowed=filterButtons.map(b=>b.dataset.filter||'all');
   catalogSearch.value=params.get('q')||'';
   const requested=params.get(filterParam)||'all';
   selectedFilter=allowed.includes(requested)?requested:'all';
   applyCatalogFilters({syncUrl:false});
  };
  catalogSearch.addEventListener('input',()=>applyCatalogFilters());
  filterButtons.forEach(button=>button.addEventListener('click',()=>{selectedFilter=button.dataset.filter||'all';applyCatalogFilters()}));
  document.querySelector('[data-catalog-reset]')?.addEventListener('click',()=>{
   catalogSearch.value='';selectedFilter='all';applyCatalogFilters();
   catalogSearch.focus();
  });
  window.addEventListener('popstate',restoreCatalogState);
  restoreCatalogState();
 }
 const newsletter=document.querySelector('#newsletter-form');if(newsletter)newsletter.addEventListener('submit',e=>{e.preventDefault();const msg=newsletter.querySelector('.form-message');if(msg)msg.textContent='Thanks for your interest! This demo does not submit or store your email.';newsletter.reset()});
 const tripForm=document.querySelector('#trip-form');if(tripForm)tripForm.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(tripForm),name=data.get('trip-name')||'My next adventure',destination=data.get('trip-destination')||'Somewhere wonderful',days=data.get('trip-days')||'3',style=data.get('trip-style')||'A little of everything',budget=data.get('trip-budget')||'Flexible',notes=data.get('trip-notes')||'No notes added yet.';const preview=document.querySelector('#itinerary-preview');if(preview)preview.innerHTML='<p class="eyebrow light">YOUR TRIP SKETCH</p><h3>'+escapeHtml(name)+'</h3><p><b>Destination:</b> '+escapeHtml(destination)+'</p><p><b>Duration:</b> '+escapeHtml(days)+' days · <b>Style:</b> '+escapeHtml(style)+'</p><p><b>Budget:</b> '+escapeHtml(budget)+'</p><p><b>Your notes</b><br>'+escapeHtml(notes)+'</p><div class="callout">This is a planning sketch only. No bookings are made and no data is sent to a server.</div><button class="button button-light" id="download-trip" type="button">Download trip sketch ↓</button>';const download=document.querySelector('#download-trip');if(download)download.addEventListener('click',()=>{const text=name+'\nDestination: '+destination+'\nDuration: '+days+' days\nTravel style: '+style+'\nBudget: '+budget+'\nNotes: '+notes+'\n\nPlanning sketch only — no reservations made.';const blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wanderly-trip-sketch.txt';a.click();URL.revokeObjectURL(url)})});
 const industryGrid=document.querySelector('#industry-grid'),industryCards=industryGrid?[...industryGrid.querySelectorAll('.industry-card')]:[],industrySearch=document.querySelector('#industry-search'),industryButtons=[...document.querySelectorAll('[data-industry-filter]')];
 if(industryGrid&&industrySearch&&industryCards.length){
  let phase='all';
  let empty=industryGrid.querySelector('.industry-empty-state');
  if(!empty){empty=document.createElement('div');empty.className='empty-state industry-empty-state';empty.setAttribute('role','status');empty.setAttribute('aria-live','polite');empty.textContent='No categories match your search. Try another keyword or clear the filters.';industryGrid.appendChild(empty)}
  const norm=value=>String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim();
  const applyIndustry=({syncUrl=true}={})=>{
   const terms=norm(industrySearch.value).split(/\\s+/).filter(Boolean);let count=0;
   industryCards.forEach(card=>{const haystack=norm([card.dataset.searchable,card.textContent].join(' '));const matches=terms.every(term=>haystack.includes(term))&&(phase==='all'||card.dataset.phase===phase);card.hidden=!matches;if(matches)count++});
   empty.hidden=count!==0;const status=document.querySelector('#industry-count');if(status)status.textContent=count+' categor'+(count===1?'y':'ies')+' shown';
   industryButtons.forEach(button=>{const active=(button.dataset.industryFilter||'all')===phase;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
   if(syncUrl){const params=new URLSearchParams(location.search);if(industrySearch.value.trim())params.set('q',industrySearch.value.trim());else params.delete('q');if(phase!=='all')params.set('phase',phase);else params.delete('phase');const query=params.toString();history.replaceState({},'',location.pathname+(query?'?'+query:''))}
  };
  const restoreIndustry=()=>{const params=new URLSearchParams(location.search),valid=industryButtons.map(b=>b.dataset.industryFilter);industrySearch.value=params.get('q')||'';phase=valid.includes(params.get('phase'))?params.get('phase'):'all';applyIndustry({syncUrl:false})};
  industrySearch.addEventListener('input',()=>applyIndustry());
  industryButtons.forEach(button=>button.addEventListener('click',()=>{phase=button.dataset.industryFilter||'all';applyIndustry()}));
  document.querySelector('[data-industry-reset]')?.addEventListener('click',()=>{industrySearch.value='';phase='all';applyIndustry();industrySearch.focus()});
  window.addEventListener('popstate',restoreIndustry);restoreIndustry();
 }
 const tripDestination=document.querySelector('[name="trip-destination"]');if(tripDestination){const queryDestination=new URLSearchParams(window.location.search).get('destination');if(queryDestination)tripDestination.value=queryDestination}
 const tripStyle=document.querySelector('[name="trip-style"]');if(tripStyle){const queryStyle=new URLSearchParams(window.location.search).get('style');if(queryStyle&&[...tripStyle.options].some(option=>option.value===queryStyle||option.textContent.trim()===queryStyle)){const matching=[...tripStyle.options].find(option=>option.value===queryStyle||option.textContent.trim()===queryStyle);tripStyle.value=matching.value;}}
 // Universal card/category details: every catalogue card can open an accessible, expanded detail view.
 const detailCards=[...document.querySelectorAll('.catalog-card, .info-card, .experience-tile, .destination-card')];
 if(detailCards.length){
  const dialog=document.createElement('dialog');dialog.className='detail-dialog';dialog.setAttribute('aria-labelledby','detail-dialog-title');
  dialog.innerHTML='<div class="detail-dialog-top"><p class="eyebrow">WANDERLY FIELD GUIDE</p><button type="button" class="detail-dialog-close" aria-label="Close details">×</button></div><div class="detail-dialog-content"></div>';
  document.body.appendChild(dialog);
  const close=dialog.querySelector('.detail-dialog-close'),content=dialog.querySelector('.detail-dialog-content');
  const openDetails=(card)=>{
   const title=card.querySelector('h3,h2')?.textContent?.trim()||card.querySelector('.destination-caption h3')?.textContent?.trim()||'Travel details';
   const eyebrow=card.querySelector('.eyebrow,.card-tag')?.textContent?.trim()||'TRAVEL GUIDE';
   const paragraphs=[...card.querySelectorAll('p')].map(p=>p.textContent.trim()).filter(t=>t&&t!==eyebrow&&!pIsEyebrow(t,eyebrow));
   const description=paragraphs[0]||card.querySelector('.destination-caption')?.textContent?.trim()||'Explore this option and verify current details before making arrangements.';
   const imageEl=card.querySelector('img'),imageMarkup=imageEl?'<img class="detail-dialog-image" src="'+escapeHtml(imageEl.src)+'" alt="'+escapeHtml(imageEl.alt||title)+'">':'';
   const category=card.dataset.category||card.dataset.phase||eyebrow;
   const links=[...card.querySelectorAll('a[href]')].map(a=>({href:a.href,label:a.textContent.trim()})).filter(a=>a.label&&a.href&&!a.href.endsWith('#'));
   const primary=links[0];
   const fit=title.toLowerCase().includes('transport')||title.toLowerCase().includes('rail')||title.toLowerCase().includes('road')?'Compare total door-to-door time, reliability, accessibility and the full fare.':title.toLowerCase().includes('stay')||title.toLowerCase().includes('hotel')||title.toLowerCase().includes('rental')?'Compare location, inclusions, total price, cancellation terms and accessibility.':title.toLowerCase().includes('software')||title.toLowerCase().includes('system')||title.toLowerCase().includes('distribution')?'Validate provider, features, integrations, support, data handling and total cost against your real workflow.':'Match the option to your dates, interests, group needs, budget and preferred pace.';
   const checklist=title.toLowerCase().includes('software')||title.toLowerCase().includes('system')||title.toLowerCase().includes('distribution')?['Open the official provider page and verify current product scope.','Confirm pricing model, plan limits, regional availability and support.','Test the exact workflow, integrations, export and security requirements.']:['Check dates, seasonality, access rules and current local guidance.','Confirm total cost, inclusions, cancellation terms and provider contacts.','Review accessibility, safety, travel time and a backup option.'];
   content.innerHTML=imageMarkup+'<p class="eyebrow">'+escapeHtml(eyebrow)+'</p><h2 id="detail-dialog-title">'+escapeHtml(title)+'</h2><p class="detail-dialog-lead">'+escapeHtml(description)+'</p><div class="detail-dialog-grid"><section><h3>Overview</h3><p>This entry sits within <b>'+escapeHtml(category.replace(/\|/g,', '))+'</b>. Use the summary as a starting point, then confirm the exact offer, operating conditions and current details with the relevant provider or official source.</p></section><section><h3>Who it may suit</h3><p>'+escapeHtml(fit)+'</p></section><section><h3>Planning checklist</h3><ul>'+checklist.map(item=>'<li>'+escapeHtml(item)+'</li>').join('')+'</ul></section><section><h3>What to verify</h3><p>Check recent information, exact inclusions, additional fees, change or cancellation conditions, accessibility, safety and the contact route for support. Do not treat illustrative descriptions as live availability or a guarantee.</p></section></div><div class="detail-dialog-actions">'+(primary?'<a class="button button-dark" href="'+escapeHtml(primary.href)+'">'+escapeHtml(primary.label||'Continue')+' ↗</a>':'')+'<a class="button button-light detail-dialog-plan" href="plan.html">Add to trip plan ↗</a></div>';
   if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  };
  function pIsEyebrow(text,eyebrow){return text===eyebrow;}
  detailCards.forEach(card=>{
   if(card.classList.contains('destination-card')){return}
   const trigger=document.createElement('button');trigger.type='button';trigger.className='card-detail-trigger';trigger.textContent=card.classList.contains('industry-card')?'Open category detail ↗':'View full details ↗';trigger.addEventListener('click',()=>{if(card.classList.contains('industry-card')&&card.dataset.detailSlug){window.location.href='industry-detail.html?category='+encodeURIComponent(card.dataset.detailSlug);return}openDetails(card)});
   const body=card.querySelector('.catalog-card-body')||card;
   if(!body.querySelector('.card-detail-trigger'))body.appendChild(trigger);
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open)dialog.close()});
 }
 function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
});