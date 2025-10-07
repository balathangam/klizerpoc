export default function decorate(block) {
    // GraphQL query for fetching order details by order number
    const ORDER_BY_NUMBER_QUERY = `
        query ORDER_BY_NUMBER($orderNumber: String!) {
            customer {
                orders(filter: { number: { eq: $orderNumber } }) {
                    items {
                        shipments {
                            tracking {
                                title
                                number
                                carrier
                            }
                        }
                    }
                }
            }
        }
    `;

    // GraphQL mutation for tracking shipment
    const TRACK_SHIPMENT_MUTATION = `
        mutation MyMutation($trackingNumber: String!, $userId: String!) {
            trackShipment(input: {trackingNumber: $trackingNumber, userId: $userId}) {
                ... on TrackingResponse {
                    trackingNumber
                    status
                    error
                    details
                }
            }
        }
    `;

    // API endpoint
    const API_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/433b712d-00d7-4099-bc01-542a0ebcdd05/graphql';
    
    // User ID for tracking
    const userId = '605DCKAP6889';

    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'shipment-tracking-container';
    
    // Create form
    const form = document.createElement('form');
    form.className = 'tracking-form';
    form.addEventListener('submit', handleOrderSubmit);
    
    // Create form elements
    const title = document.createElement('h2');
    title.textContent = 'Track Your Order';
    title.className = 'tracking-title';
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    
    const label = document.createElement('label');
    label.textContent = 'Order Number:';
    label.setAttribute('for', 'orderNumber');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'orderNumber';
    input.name = 'orderNumber';
    input.placeholder = 'Enter order number';
    input.required = true;
    input.className = 'tracking-input';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Track Order';
    submitBtn.className = 'tracking-submit';
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading hidden';
    loadingDiv.textContent = 'Fetching order details...';
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'tracking-result';
    
    // Assemble form
    inputGroup.appendChild(label);
    inputGroup.appendChild(input);
    form.appendChild(title);
    form.appendChild(inputGroup);
    form.appendChild(submitBtn);
    form.appendChild(loadingDiv);
    form.appendChild(resultDiv);
    
    // Append form to container
    formContainer.appendChild(form);
    
    // Append form to block
    block.appendChild(formContainer);

    // Form submit handler
    async function handleOrderSubmit(event) {
        event.preventDefault();
        
        const orderNumber = input.value.trim();
        const loadingEl = form.querySelector('.loading');
        const resultEl = form.querySelector('.tracking-result');
        
        if (!orderNumber) {
            showResult('Please enter an order number.', 'error');
            return;
        }
        
        // Show loading
        loadingEl.classList.remove('hidden');
        resultEl.innerHTML = '';
        
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required authentication headers here
                    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                    // 'x-api-key': 'YOUR_API_KEY',
                },
                body: JSON.stringify({
                    query: ORDER_BY_NUMBER_QUERY,
                    variables: {
                        orderNumber: orderNumber
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check for GraphQL errors
            if (data.errors) {
                showResult('Error fetching order details', 'error');
                return;
            }

            console.log('Full GraphQL response:', data);
            console.log('Data structure:', JSON.stringify(data, null, 2));

            // Extract order data
            const orderData = data.data?.customer?.orders?.items;
            
            if (orderData && orderData.length > 0) {
                const order = orderData[0];
                
                if (order.shipments && order.shipments.length > 0) {
                    displayOrderResult(order);
                } else {
                    showResult('No shipments found for this order', 'info');
                }
            } else {
                showResult('No orders found with this order number', 'error');
            }

        } catch (error) {
            showResult(`Network error: ${error.message}`, 'error');
        } finally {
            loadingEl.classList.add('hidden');
        }
    }

    // Display order result
    function displayOrderResult(order) {
        const resultEl = form.querySelector('.tracking-result');
        
        if (!order.shipments || order.shipments.length === 0) {
            showResult('No shipments found for this order', 'info');
            return;
        }
        
        let resultHTML = `
            <div class="tracking-success">
                <h3>Order Details</h3>
                <div class="tracking-details">
                    <p><strong>Order Number:</strong> ${input.value.trim()}</p>
                    <p><strong>Shipments Found:</strong> ${order.shipments.length}</p>
        `;
        
        order.shipments.forEach((shipment, index) => {
            if (shipment.tracking && shipment.tracking.length > 0) {
                
                // Access the first tracking item since tracking is an array
                const trackingInfo = shipment.tracking[0];
                const title = trackingInfo.title || 'N/A';
                const number = trackingInfo.number || 'N/A';
                const carrier = trackingInfo.carrier || 'N/A';
                console.log('Tracking number:', number);
                
                resultHTML += `
                    <div class="shipment-info">
                        <h4>Shipment ${index + 1}</h4>
                        <p><strong>Title:</strong> ${title}</p>
                        <p><strong>Tracking Number:</strong> ${number}</p>
                        <p><strong>Carrier:</strong> ${carrier}</p>
                        <div class="tracking-details-loading" id="tracking-${index}">
                            <p>Loading tracking details...</p>
                        </div>
                    </div>
                `;
                
                // Fetch tracking details for this shipment
                if (number && number !== 'N/A') {
                    fetchTrackingDetails(number, index);
                }
            } else {
                resultHTML += `
                    <div class="shipment-info">
                        <h4>Shipment ${index + 1}</h4>
                        <p><strong>Status:</strong> No tracking information available</p>
                    </div>
                `;
            }
        });
        
        resultHTML += `
                </div>
            </div>
        `;
        
        resultEl.innerHTML = resultHTML;
    }

    // Fetch tracking details for a specific shipment
    async function fetchTrackingDetails(trackingNumber, shipmentIndex) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any required authentication headers here
                    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                    // 'x-api-key': 'YOUR_API_KEY',
                },
                body: JSON.stringify({
                    query: TRACK_SHIPMENT_MUTATION,
                    variables: {
                        trackingNumber: trackingNumber,
                        userId: userId
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Tracking API response:', data);

            // Check for GraphQL errors
            if (data.errors) {
                displayTrackingError(shipmentIndex, 'Error fetching tracking details');
                return;
            }

            // Extract tracking data
            const trackingData = data.data?.trackShipment;
            if (trackingData) {
                displayTrackingResult(trackingData, shipmentIndex);
            } else {
                displayTrackingError(shipmentIndex, 'No tracking data received');
            }

        } catch (error) {
            console.error('Error fetching tracking details:', error);
            displayTrackingError(shipmentIndex, `Network error: ${error.message}`);
        }
    }

    // Display tracking result for a specific shipment
    function displayTrackingResult(trackingData, shipmentIndex) {
        const trackingElement = document.getElementById(`tracking-${shipmentIndex}`);
        if (!trackingElement) return;

        if (trackingData.error && trackingData.error.trim() !== '') {
            trackingElement.innerHTML = `
                <div class="tracking-error">
                    <p><strong>Error:</strong> ${trackingData.error}</p>
                </div>
            `;
            return;
        }

        const resultHTML = `
            <div class="tracking-success">
                <h5>Tracking Details</h5>
                <div class="tracking-details">
                    <p><strong>Tracking Number:</strong> ${trackingData.trackingNumber || 'N/A'}</p>
                    <p><strong>Status:</strong> ${trackingData.status || 'N/A'}</p>
                    ${trackingData.details ? `<p><strong>Details:</strong> ${trackingData.details}</p>` : ''}
                </div>
            </div>
        `;
        
        trackingElement.innerHTML = resultHTML;
    }

    // Display tracking error for a specific shipment
    function displayTrackingError(shipmentIndex, message) {
        const trackingElement = document.getElementById(`tracking-${shipmentIndex}`);
        if (!trackingElement) return;

        trackingElement.innerHTML = `
            <div class="tracking-error">
                <p><strong>Error:</strong> ${message}</p>
            </div>
        `;
    }

    // Show result message
    function showResult(message, type = 'info') {
        const resultEl = form.querySelector('.tracking-result');
        resultEl.innerHTML = `<div class="tracking-${type}">${message}</div>`;
    }
}