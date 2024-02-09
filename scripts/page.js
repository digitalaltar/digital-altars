document.addEventListener('DOMContentLoaded', function() {
  fetch('data.json')
  .then(response => response.json())
  .then(data => {
      const digital = data.digital;
      const altar = data.altar;

      const randomDigital = digital[Math.floor(Math.random() * digital.length)];
      const randomAltar = altar[Math.floor(Math.random() * altar.length)];

      document.querySelector('.digital').textContent = randomDigital;
      document.querySelector('.altar').textContent = randomAltar;
  })
  .catch(error => console.log('Error loading the data:', error));
});