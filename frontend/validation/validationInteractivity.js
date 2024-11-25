document.getElementById("regConfirmPassword").addEventListener("input", function() {
        let password = document.getElementById("regPassword").value;
        let confirmPassword = document.getElementById("regConfirmPassword").value;
        let errorMessage = document.getElementById("passwordError");
        let submitButton = document.getElementById("regBtn");

        if (password !== confirmPassword) {
            errorMessage.style.display = "inline";
            submitButton.disabled = true;
        } else {
            errorMessage.style.display = "none";
            submitButton.disabled = false;
        }
    });

    function showMap() {
        const mapSection = document.getElementById('map-section');
        mapSection.style.display = 'block';
    }