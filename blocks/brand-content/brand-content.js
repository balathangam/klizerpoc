import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
    // 1. Get the brand ID from the URL path
    const urlPath = window.location.pathname;
    const pathSegments = urlPath.replace(/^\/|\/$/g, '').split('/');
    const brandId = pathSegments[pathSegments.length - 1];

    if (!brandId) {
        console.warn('Brand ID not found in the URL. Hiding banner block.');
        block.style.display = 'none'; // Hide the block if there's no brand ID
        return;
    }

    // 2. Find the banner image data that matches the brand ID
    let brandBannerData = null;
    Array.from(block.children).forEach(rowDiv => {
        // Find the brand name from the first div/cell
        const tempTitle = rowDiv.children[0].querySelector("p")?.textContent.trim();
        // Find the picture element from the second div/cell
        const tempPicture = rowDiv.children[1].querySelector("picture");

        if (tempTitle && tempTitle.toLowerCase() === brandId.toLowerCase() && tempPicture) {
            brandBannerData = {
                src: tempPicture.querySelector('img').src,
                alt: tempPicture.querySelector('img').alt || "Banner for " + brandId,
            };
        }
    });

    // 3. Clear the block's existing content and inject the new banner
    if (brandBannerData) {
        block.innerHTML = ''; // Clear all existing content from the block
        
        // Create a responsive picture element with multiple image sources
        const picture = createOptimizedPicture(
            brandBannerData.src,
            brandBannerData.alt,
            [{ media: '(min-width: 900px)', width: '1920' }, // Desktop
             { media: '(min-width: 600px)', width: '1024' }, // Tablet
             { width: '768' }] // Mobile
        );

        block.append(picture);
    } else {
        // Handle case where no matching banner content is found
        console.warn(`No banner content found for brand: ${brandId}`);
        block.style.display = 'none';
    }
}