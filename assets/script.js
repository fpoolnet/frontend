// Simple script file for potential future interactivity
console.log("Script loaded: Modern UI is ready!");

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('configModal');
    const closeButton = document.querySelector('.close-button');
    const configButtons = document.querySelectorAll('.config-button');
    const miningAddressInput = document.getElementById('miningAddressInput');
    const addressValidationStatus = document.getElementById('addressValidationStatus');
    const downloadConfigButton = document.getElementById('downloadConfigButton');
    const modalPoolType = document.getElementById('modalPoolType');

    let currentPool = null; // To store which pool's config button was clicked

    // Function to show the modal
    function showModal(poolType, miningAddress) {
        // Set display to 'flex' to enable centering via CSS properties
        modal.style.display = 'flex';
        modalPoolType.textContent = poolType;
        miningAddressInput.value = ''; // Clear previous input
        addressValidationStatus.textContent = ''; // Clear previous status
        addressValidationStatus.className = 'validation-status'; // Reset status class
        downloadConfigButton.disabled = true; // Disable download button initially
        currentPool = poolType; // Store the pool type
        miningAddressInput.focus(); // Optional: focus the input field
    }

    // Function to hide the modal
    function hideModal() {
        modal.style.display = 'none';
        currentPool = null; // Clear current pool
    }

    // Basic address validation (can be improved with more specific regex per coin)
    function validateAddress(address, poolType) {
        if (!address || address.trim().length != 34) {
            return false;
        }
    
        // Address must start with 'f' or 'F' and then 34 valid base58 characters
        if (!/^[fF][a-km-zA-HJ-NP-Z1-9]{33}$/.test(address.trim())) {
            return false;
        }
    
        return true;
    }

    // Function to generate fminer config content
    function generateConfig(poolType, address, username) {
        // Find the pool address from the corresponding mining card
        const poolAddressElement = document.querySelector(`.mining-card[data-pool="${poolType}"] .detail-row .value[data-mining-address]`);
        if (!poolAddressElement) {
            alert("unexpected error !")
            return
        }
        const poolAddress = poolAddressElement.getAttribute('data-mining-address')
    
        // Build .conf content
        let config = `# Debug level for miner logs: trace, debug, info, warn, error
debuglevel=info

# Mining pool connection address (host:port)
pool=${poolAddress}

# Your wallet address for receiving mining rewards
address=${address.trim()}
    `;

    if (username.trim().length > 0)  {
        config += `
# Optional username (will be included in the coinbase transaction as a custom tag)
user=${username.trim()}
    `
    }
    
        return config;
    }

    // Add event listeners to each config button
    configButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Find the parent card and get the pool type
            const card = button.closest('.mining-card');
            if (card) {
                const poolType = card.getAttribute('data-pool');
                showModal(poolType);
            }
        });
    });

    // Add event listener to close button
    closeButton.addEventListener('click', hideModal);

    // Close the modal if the user clicks outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Add event listener for input changes
    miningAddressInput.addEventListener('input', () => {
        const address = miningAddressInput.value.trim();
        const isValid = validateAddress(address, currentPool);

        if (address === '') {
            addressValidationStatus.textContent = '';
            addressValidationStatus.className = 'validation-status';
            downloadConfigButton.disabled = true;
        } else if (isValid) {
            addressValidationStatus.textContent = 'Valid address';
            addressValidationStatus.className = 'validation-status valid';
            downloadConfigButton.disabled = false;
        } else {
            addressValidationStatus.textContent = 'Invalid address';
            addressValidationStatus.className = 'validation-status invalid';
            downloadConfigButton.disabled = true;
        }
    });

    // Add event listener for download button
    downloadConfigButton.addEventListener('click', () => {
        const address = miningAddressInput.value.trim();
        const username = usernameInput.value.trim();

        if (validateAddress(address, currentPool)) {
            const configContent = generateConfig(currentPool, address, username);
            const blob = new Blob([configContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fminer-${currentPool.toLowerCase()}-${address.substring(0,2)}${address.substring(address.length-2)}.conf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Clean up

            hideModal(); // Close modal after download
        }
    });

    const video = document.getElementById('fishing-video');
    const loader = document.getElementById('video-loader');
    const progress = document.getElementById('video-progress');

    let fakeProgress = 0;
    const loadingInterval = setInterval(() => {
        fakeProgress += Math.random() * 10; // simulate loading
        if (fakeProgress >= 100) fakeProgress = 100;
        progress.style.width = fakeProgress + '%';

        if (fakeProgress >= 100) {
        clearInterval(loadingInterval);
        loader.style.display = 'none';
        video.style.display = 'block';
        }
    }, 200);

    // Bonus: If the video really loads faster
    video.addEventListener('canplaythrough', () => {
        clearInterval(loadingInterval);
        loader.style.display = 'none';
        progress.style.width = '100%';
        video.style.display = 'block';
    });
});