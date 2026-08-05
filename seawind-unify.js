(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover:hover)').matches;
  if(reduced || !canHover) return;

  /* ---------- magnetic buttons (same feel as the hero CTAs) ---------- */
  document.querySelectorAll('.btn-primary,.btn-nav,.hm-btn-primary,.cta-submit-btn,.btn-outline,.hm-btn-ghost').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width/2;
      var y = e.clientY - r.top - r.height/2;
      btn.style.transform = 'translate(' + x*0.18 + 'px,' + y*0.26 + 'px)';
    });
    btn.addEventListener('mouseleave', function(){ btn.style.transform = 'translate(0,0)'; });
  });

  /* ---------- card tilt (hooks the .tilt-card class already present in the markup) ---------- */
  document.querySelectorAll('.tilt-card').forEach(function(card){
    var rX = 0, rY = 0, tX = 0, tY = 0, raf = null;
    function apply(){
      rX += (tX-rX)*0.14; rY += (tY-rY)*0.14;
      card.style.transform = 'perspective(1000px) rotateX(' + rX + 'deg) rotateY(' + rY + 'deg) translateZ(0)';
      if(Math.abs(tX-rX)>0.01 || Math.abs(tY-rY)>0.01){ raf = requestAnimationFrame(apply); }
      else { raf = null; }
    }
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left)/r.width - 0.5;
      var py = (e.clientY - r.top)/r.height - 0.5;
      tX = py*-4; tY = px*5;
      if(!raf) raf = requestAnimationFrame(apply);
    });
    card.addEventListener('mouseleave', function(){
      tX = 0; tY = 0;
      if(!raf) raf = requestAnimationFrame(apply);
    });
  });
})();
