var _patchNotes = [];
var _currentPatchIdx = null;

function initPatchnote() {
  var adminBar = document.getElementById('patchnote-admin-bar');
  if (adminBar) adminBar.style.display = isAdmin() ? 'block' : 'none';
  _loadPatchnotes();
}

function _loadPatchnotes() {
  var root = document.getElementById('patchnote-content');
  if (!root) return;

  window.$db.on('stella_update_notes', function(val) {
    if (!val || !val.length) {
      root.innerHTML = '<div class="empty" style="padding:40px;font-size:14px;">등록된 패치노트가 없습니다.</div>';
      return;
    }
    var sorted = val.slice().sort(function(a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
    _patchNotes = sorted;

    root.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px;max-width:720px;margin:0 auto;">' +
      sorted.map(function(n, i) {
        var d    = n.date ? new Date(n.date) : null;
        var dStr = d ? d.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' }) : '';
        return '<div class="card patchnote-card" onclick="openPatchnoteDetail(' + i + ')" style="cursor:pointer;transition:border-color .15s;" onmouseover="this.style.borderColor=\'var(--purple)\'" onmouseout="this.style.borderColor=\'\'">' +
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">' +
            '<div style="flex:1;min-width:0;">' +
              '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;">' + (n.title || '(제목 없음)') + '</div>' +
              '<div style="font-size:12px;color:var(--muted);">' + dStr + '</div>' +
              '<div style="font-size:12px;color:var(--sub);margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:500px;">' +
                (n.content || '').split('\n')[0] +
              '</div>' +
            '</div>' +
            (isAdmin() ? '<div style="display:flex;gap:6px;flex-shrink:0;" onclick="event.stopPropagation()">' +
              '<button onclick="editPatchnote(' + i + ')" style="padding:4px 10px;font-size:11px;border-radius:8px;background:var(--purple-dim);color:var(--purple);border:1px solid var(--purple);cursor:pointer;">✏️</button>' +
              '<button onclick="deletePatchnote(' + i + ')" style="padding:4px 10px;font-size:11px;border-radius:8px;background:var(--red-dim);color:var(--red);border:1px solid var(--red);cursor:pointer;">🗑</button>' +
            '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  });
}

function openPatchnoteDetail(idx) {
  var n    = _patchNotes[idx];
  if (!n) return;
  _currentPatchIdx = idx;
  var d    = n.date ? new Date(n.date) : null;
  var dStr = d ? d.toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' }) : '';

  var m = document.createElement('div');
  m.className = 'modal-bg';
  m.style.cssText = 'position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;';
  m.onclick = function(e) { if (e.target === m) m.remove(); };
  m.innerHTML =
    '<div style="background:var(--bg-2);border:1px solid var(--b2);border-radius:16px;width:100%;max-width:560px;overflow:hidden;">' +
      '<div style="padding:18px 20px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;">' +
        '<div>' +
          '<div style="font-size:15px;font-weight:700;color:var(--text);">' + (n.title || '패치노트') + '</div>' +
          '<div style="font-size:11px;color:var(--muted);margin-top:2px;">' + dStr + '</div>' +
        '</div>' +
        '<button onclick="this.closest(\'.modal-bg\').remove()" style="background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;line-height:1;">×</button>' +
      '</div>' +
      '<div style="padding:20px;max-height:500px;overflow-y:auto;font-size:13px;color:var(--sub);line-height:1.9;white-space:pre-wrap;">' + (n.content || '') + '</div>' +
    '</div>';
  document.body.appendChild(m);
}

function openPatchnoteModal(existingNote, editIdx) {
  var titleVal   = existingNote ? (existingNote.title   || '') : '';
  var contentVal = existingNote ? (existingNote.content || '') : '';
  var m = document.createElement('div');
  m.className = 'modal-bg';
  m.style.cssText = 'position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;';
  m.onclick = function(e) { if (e.target === m) m.remove(); };
  m.innerHTML =
    '<div class="modal" style="max-width:520px;width:100%;">' +
      '<div class="modal-title">' + (existingNote ? '✏️ 패치노트 수정' : '📝 패치노트 작성') + '</div>' +
      '<input class="input" id="patch-title-inp" placeholder="제목..." value="' + titleVal.replace(/"/g, '&quot;') + '" style="margin-bottom:10px;">' +
      '<textarea class="input" id="patch-content-inp" rows="10" placeholder="내용..." style="resize:vertical;">' + contentVal + '</textarea>' +
      '<div class="modal-btns">' +
        '<button class="btn" onclick="this.closest(\'.modal-bg\').remove()">취소</button>' +
        '<button class="btn btn-primary" onclick="savePatchnote(' + (editIdx != null ? editIdx : 'null') + ', this)">저장</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(m);
}

function editPatchnote(idx) { openPatchnoteModal(_patchNotes[idx], idx); }

async function savePatchnote(editIdx, btn) {
  var title   = document.getElementById('patch-title-inp')?.value?.trim()   || '';
  var content = document.getElementById('patch-content-inp')?.value?.trim() || '';
  if (!content) { alert('내용을 입력해주세요.'); return; }
  btn.disabled = true; btn.textContent = '저장 중...';
  var notes = (_patchNotes || []).slice();
  var note  = { title: title, content: content, date: editIdx != null ? (notes[editIdx]?.date || new Date().toISOString()) : new Date().toISOString() };
  if (editIdx != null) { notes[editIdx] = note; } else { notes.unshift(note); }
  try {
    await firebase.database().ref('stella_update_notes').set(notes);
    btn.closest('.modal-bg').remove();
  } catch(e) {
    alert('저장 실패: ' + e.message);
    btn.disabled = false; btn.textContent = '저장';
  }
}

async function deletePatchnote(idx) {
  if (!confirm('이 패치노트를 삭제할까요?')) return;
  var notes = (_patchNotes || []).filter(function(_, i) { return i !== idx; });
  try {
    await firebase.database().ref('stella_update_notes').set(notes);
  } catch(e) { alert('삭제 실패: ' + e.message); }
}
