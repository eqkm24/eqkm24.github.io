/* ═══ 강화 가이드 ═══ */

/* ── 강화 가이드 서브탭 전환 (주문서/보주) ── */
function switchEtab(t) {
  document.querySelectorAll('.etab-panel').forEach(p => p.classList.remove('eon'));
  document.querySelectorAll('.etab').forEach(b => b.classList.remove('es','eo','on'));
  document.getElementById('etab-' + t).classList.add('eon');
  if (t === 'scroll') { document.querySelectorAll('.etab')[0].classList.add('es'); }
  else                { document.querySelectorAll('.etab')[1].classList.add('eo'); }
}
