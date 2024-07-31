document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('popup-modal');
    const closeButton = document.querySelector('.close-button');
    const requestButton = document.getElementById('request-button');
    const itemList = document.getElementById('item-list');
    const modalTitle = document.getElementById('modal-title');
  
    const sportItems = {
      cricket: ['Cricket Bat', 'Cricket Ball', 'Stumps', 'Pads', 'Helmet'],
      badminton: ['Badminton Racket', 'Shuttlecock', 'Net', 'Court Shoes'],
      football: ['Football', 'Goal Net', 'Shin Guards', 'Football Boots'],
      basketball: ['Basketball', 'Hoop', 'Net', 'Court Shoes'],
      lawn_tennis: ['Tennis Racket', 'Tennis Ball', 'Net', 'Court Shoes'],
      table_tennis: ['Table Tennis Racket', 'Table Tennis Ball', 'Table', 'Net']
    };
  
    const sportCards = document.querySelectorAll('.sport-card');
    sportCards.forEach(card => {
      card.addEventListener('click', () => {
        const sport = card.getAttribute('data-sport');
        showPopup(sport);
      });
    });
  
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    window.addEventListener('click', event => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    });
  
    requestButton.addEventListener('click', () => {
      alert('Items requested successfully!');
      modal.style.display = 'none';
    });
  
    function showPopup(sport) {
      modalTitle.textContent = `Request ${sport.charAt(0).toUpperCase() + sport.slice(1)} Items`;
      itemList.innerHTML = '';
      sportItems[sport].forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
          <label>${item}</label>
          <input type="number" min="0" max="10" value="0" />
        `;
        itemList.appendChild(itemDiv);
      });
      modal.style.display = 'block';
    }
  });
  