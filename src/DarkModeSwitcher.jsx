import { createElement, useCallback, useEffect, useState } from "react";

// Optional: Import CSS for the widget itself
import "./ui/DarkModeSwitcher.css";

// Constants for theme modes
const LIGHT = "light";
const DARK = "dark";
const SYSTEM = "system";

export function DarkModeSwitcher(props) {
    const {
        lightClassName,
        darkClassName,
        storageKey,
        defaultTheme,
        uiType,
        targetSelector,
        buttonLabels,
        style // Mendix passes style automatically
    } = props;

    // State to hold the user's *selected* preference ('light', 'dark', 'system')
    const [selectedTheme, setSelectedTheme] = useState(defaultTheme); // Initialize with default

    // Function to apply the correct CSS class based on selection and system preference
    const applyTheme = useCallback(
        themePreference => {
            const targetElement = document.querySelector(targetSelector) || document.body;
            let themeToApply = themePreference;

            // If system is selected, determine the actual system theme
            if (themePreference === SYSTEM) {
                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                themeToApply = systemPrefersDark ? DARK : LIGHT;
            }

            // Remove existing theme classes
            targetElement.classList.remove(lightClassName, darkClassName);

            // Add the appropriate class
            if (themeToApply === LIGHT) {
                targetElement.classList.add(lightClassName);
            } else if (themeToApply === DARK) {
                targetElement.classList.add(darkClassName);
            }
            // No class needed if it defaults to light without a specific class,
            // but explicitly adding lightClassName is generally better.
        },
        [lightClassName, darkClassName, targetSelector]
    ); // Dependencies for the function

    // Effect to load preference from localStorage and apply initial theme on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem(storageKey);
        const initialTheme = storedTheme || defaultTheme; // Use stored or default
        setSelectedTheme(initialTheme); // Update state
        applyTheme(initialTheme); // Apply the initial theme classes
    }, [storageKey, defaultTheme, applyTheme]); // Run only once on mount (effectively, as applyTheme deps are stable)

    // Effect to handle changes in selectedTheme (user interaction or initial load)
    useEffect(() => {
        // Save the *selected* preference to local storage
        localStorage.setItem(storageKey, selectedTheme);
        // Apply the theme based on the *newly selected* preference
        applyTheme(selectedTheme);

        // --- Listener for System Preference Changes ---
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleSystemThemeChange = event => {
            // Only re-apply if the user's *selected* preference is 'system'
            if (selectedTheme === SYSTEM) {
                applyTheme(SYSTEM); // Re-run applyTheme which checks matchMedia again
            }
        };

        // Add listener only if 'system' is currently selected
        if (selectedTheme === SYSTEM) {
            mediaQuery.addEventListener("change", handleSystemThemeChange);
        }

        // Cleanup function: Remove listener when component unmounts or selectedTheme changes
        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
        // Dependencies: Run when selectedTheme or applyTheme changes
    }, [selectedTheme, storageKey, applyTheme]);

    // --- Render UI ---

    const handleSelectionChange = eventOrValue => {
        const newTheme = typeof eventOrValue === "string" ? eventOrValue : event.target.value;
        setSelectedTheme(newTheme);
    };

    const renderDropdown = () => (
        <select
            className="dark-mode-switcher-select"
            value={selectedTheme}
            onChange={handleSelectionChange}
            aria-label="Select Theme"
        >
            <option value={LIGHT}>Light</option>
            <option value={DARK}>Dark</option>
            <option value={SYSTEM}>System</option>
        </select>
    );

    const renderButtons = () => {
        const labels = buttonLabels?.split(",") || ["Light", "Dark", "System"];
        const themes = [LIGHT, DARK, SYSTEM];
        return (
            <div className="dark-mode-switcher-buttons">
                {themes.map((theme, index) => (
                    <button
                        key={theme}
                        onClick={() => handleSelectionChange(theme)}
                        className={selectedTheme === theme ? "active" : ""}
                        aria-pressed={selectedTheme === theme}
                    >
                        {labels[index] || theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="dark-mode-switcher-widget" style={style}>
            {uiType === "buttons" ? renderButtons() : renderDropdown()}
        </div>
    );
}
