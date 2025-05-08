import { createSidebar } from "../utils/sidebar"; 
import { applyUserTheme } from "../utils/theme";

export function createAboutPage(navigate: (path: string) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'relative min-h-screen bg-gray-900 text-white overflow-hidden';

    // Sidebar
    const sidebar = createSidebar(navigate);
    container.appendChild(sidebar);
    // Background Image
    const backgroundImage = document.createElement('div');
    backgroundImage.id = 'backgroundImage';
    backgroundImage.className = 'absolute top-0 left-20 right-0 bottom-0 bg-cover bg-center transition-all duration-300';

    container.appendChild(backgroundImage);
    applyUserTheme(backgroundImage);

    return (container);
}