// basic client-side behavior: ensure active tab stays highlighted on link click
document.addEventListener('click', function (e) {
  if (e.target.matches('.tab')) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
  }
});
