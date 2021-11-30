// Back button
let backButton = document.querySelector('.backButton')
if (backButton != null) {
    backButton.addEventListener('click', () => {
        window.history.back()
    })
}