import React, { useState, useEffect, useCallback } from 'react';

// Icons
const ShipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 19H9c-3.3 0-6-2.7-6-6V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6c0 3.3-2.7 6-6 6z"/>
        <path d="M17 19v-2"/>
        <path d="M9 19v-2"/>
        <path d="M7 17v-4h10v4"/>
        <path d="M12 12V3"/>
        <path d="M6 8h12"/>
    </svg>
);

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
    </svg>
);

// Constants for game board size and ship types
const BOARD_ROWS = 10; // Enough rows to cover the main periodic table + Lanthanides/Actinides block
const BOARD_COLS = 18; // Standard periodic table columns
const SHIP_TYPES = [
    { naam: 'Vliegdekschip', size: 5 },
    { naam: 'Slagschip', size: 4 },
    { naam: 'Kruiser', size: 3 },
    { naam: 'Onderzeeboot', size: 3 },
    { naam: 'Torpedobootjager', size: 2 },
];
// Groups where ships can be placed and targeted
const ALLOWED_GROUPS = new Set([1, 2, 13, 14, 15, 16, 17, 18]);

// Simplified Periodic Table Data (Atomic Number, Symbol, Name, Group, Period, Type, Board Row, Board Col, Category)
// Note: Row and Col here are 0-indexed for the board grid.
// Group and Period are standard periodic table values.
const PERIODIC_TABLE_ELEMENTS = [
    // Period 1
    { an: 1, symbool: 'H', naam: 'Waterstof', groep: 1, periode: 1, type: 'Niet-metaal', categorie: 'niet-metaal', r: 0, c: 0 },
    { an: 2, symbool: 'He', naam: 'Helium', groep: 18, periode: 1, type: 'Edelgas', categorie: 'edelgas', r: 0, c: 17 },
    // Period 2
    { an: 3, symbool: 'Li', naam: 'Lithium', groep: 1, periode: 2, type: 'Alkalimetaal', categorie: 'metaal', r: 1, c: 0 },
    { an: 4, symbool: 'Be', naam: 'Beryllium', groep: 2, periode: 2, type: 'Aardalkalimetaal', categorie: 'metaal', r: 1, c: 1 },
    { an: 5, symbool: 'B', naam: 'Boor', groep: 13, periode: 2, type: 'Metalloïde', categorie: 'niet-metaal', r: 1, c: 12 },
    { an: 6, symbool: 'C', naam: 'Koolstof', groep: 14, periode: 2, type: 'Niet-metaal', categorie: 'niet-metaal', r: 1, c: 13 },
    { an: 7, symbool: 'N', naam: 'Stikstof', groep: 15, periode: 2, type: 'Niet-metaal', categorie: 'niet-metaal', r: 1, c: 14 },
    { an: 8, symbool: 'O', naam: 'Zuurstof', groep: 16, periode: 2, type: 'Niet-metaal', categorie: 'niet-metaal', r: 1, c: 15 },
    { an: 9, symbool: 'F', naam: 'Fluor', groep: 17, periode: 2, type: 'Halogeen', categorie: 'niet-metaal', r: 1, c: 16 },
    { an: 10, symbool: 'Ne', naam: 'Neon', groep: 18, periode: 2, type: 'Edelgas', categorie: 'edelgas', r: 1, c: 17 },
    // Period 3
    { an: 11, symbool: 'Na', naam: 'Natrium', groep: 1, periode: 3, type: 'Alkalimetaal', categorie: 'metaal', r: 2, c: 0 },
    { an: 12, symbool: 'Mg', naam: 'Magnesium', groep: 2, periode: 3, type: 'Aardalkalimetaal', categorie: 'metaal', r: 2, c: 1 },
    { an: 13, symbool: 'Al', naam: 'Aluminium', groep: 13, periode: 3, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 2, c: 12 },
    { an: 14, symbool: 'Si', naam: 'Silicium', groep: 14, periode: 3, type: 'Metalloïde', categorie: 'niet-metaal', r: 2, c: 13 },
    { an: 15, symbool: 'P', naam: 'Fosfor', groep: 15, periode: 3, type: 'Niet-metaal', categorie: 'niet-metaal', r: 2, c: 14 },
    { an: 16, symbool: 'S', naam: 'Zwavel', groep: 16, periode: 3, type: 'Niet-metaal', categorie: 'niet-metaal', r: 2, c: 15 },
    { an: 17, symbool: 'Cl', naam: 'Chloor', groep: 17, periode: 3, type: 'Halogeen', categorie: 'niet-metaal', r: 2, c: 16 },
    { an: 18, symbool: 'Ar', naam: 'Argon', groep: 18, periode: 3, type: 'Edelgas', categorie: 'edelgas', r: 2, c: 17 },
    // Period 4
    { an: 19, symbool: 'K', naam: 'Kalium', groep: 1, periode: 4, type: 'Alkalimetaal', categorie: 'metaal', r: 3, c: 0 },
    { an: 20, symbool: 'Ca', naam: 'Calcium', groep: 2, periode: 4, type: 'Aardalkalimetaal', categorie: 'metaal', r: 3, c: 1 },
    // Transition Metals and other elements (filler for visualization, not game area)
    { an: 21, symbool: 'Sc', naam: 'Scandium', groep: 3, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 2 },
    { an: 22, symbool: 'Ti', naam: 'Titanium', groep: 4, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 3 },
    { an: 23, symbool: 'V', naam: 'Vanadium', groep: 5, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 4 },
    { an: 24, symbool: 'Cr', naam: 'Chroom', groep: 6, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 5 },
    { an: 25, symbool: 'Mn', naam: 'Mangaan', groep: 7, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 6 },
    { an: 26, symbool: 'Fe', naam: 'IJzer', groep: 8, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 7 },
    { an: 27, symbool: 'Co', naam: 'Kobalt', groep: 9, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 8 },
    { an: 28, symbool: 'Ni', naam: 'Nikkel', groep: 10, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 9 },
    { an: 29, symbool: 'Cu', naam: 'Koper', groep: 11, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 10 },
    { an: 30, symbool: 'Zn', naam: 'Zink', groep: 12, periode: 4, type: 'Overgangsmetaal', categorie: 'metaal', r: 3, c: 11 },
    { an: 31, symbool: 'Ga', naam: 'Gallium', groep: 13, periode: 4, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 3, c: 12 },
    { an: 32, symbool: 'Ge', naam: 'Germanium', groep: 14, periode: 4, type: 'Metalloïde', categorie: 'metaal', r: 3, c: 13 },
    { an: 33, symbool: 'As', naam: 'Arseen', groep: 15, periode: 4, type: 'Niet-metaal', categorie: 'niet-metaal', r: 3, c: 14 },
    { an: 34, symbool: 'Se', naam: 'Seleen', groep: 16, periode: 4, type: 'Niet-metaal', categorie: 'niet-metaal', r: 3, c: 15 },
    { an: 35, symbool: 'Br', naam: 'Broom', groep: 17, periode: 4, type: 'Halogeen', categorie: 'niet-metaal', r: 3, c: 16 },
    { an: 36, 'symbool': 'Kr', 'naam': 'Krypton', 'groep': 18, 'periode': 4, 'type': 'Edelgas', 'categorie': 'edelgas', 'r': 3, 'c': 17 },
    // Period 5
    { an: 37, symbool: 'Rb', naam: 'Rubidium', groep: 1, periode: 5, type: 'Alkalimetaal', categorie: 'metaal', r: 4, c: 0 },
    { an: 38, symbool: 'Sr', naam: 'Strontium', groep: 2, periode: 5, type: 'Aardalkalimetaal', categorie: 'metaal', r: 4, c: 1 },
    { an: 39, symbool: 'Y', naam: 'Yttrium', groep: 3, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 2 },
    { an: 40, symbool: 'Zr', naam: 'Zirconium', groep: 4, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 3 },
    { an: 41, symbool: 'Nb', naam: 'Niobium', groep: 5, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 4 },
    { an: 42, symbool: 'Mo', naam: 'Molybdeen', groep: 6, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 5 },
    { an: 43, symbool: 'Tc', naam: 'Technetium', groep: 7, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 6 },
    { an: 44, symbool: 'Ru', naam: 'Ruthenium', groep: 8, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 7 },
    { an: 45, symbool: 'Rh', naam: 'Rhodium', groep: 9, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 8 },
    { an: 46, symbool: 'Pd', naam: 'Palladium', groep: 10, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 9 },
    { an: 47, symbool: 'Ag', naam: 'Zilver', groep: 11, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 10 },
    { an: 48, symbool: 'Cd', naam: 'Cadmium', groep: 12, periode: 5, type: 'Overgangsmetaal', categorie: 'metaal', r: 4, c: 11 },
    { an: 49, symbool: 'In', naam: 'Indium', groep: 13, periode: 5, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 4, c: 12 },
    { an: 50, symbool: 'Sn', naam: 'Tin', groep: 14, periode: 5, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 4, c: 13 },
    { an: 51, symbool: 'Sb', naam: 'Antimoon', groep: 15, periode: 5, type: 'Metalloïde', categorie: 'metaal', r: 4, c: 14 },
    { an: 52, symbool: 'Te', naam: 'Telluur', groep: 16, periode: 5, type: 'Niet-metaal', categorie: 'niet-metaal', r: 4, c: 15 },
    { an: 53, symbool: 'I', naam: 'Jood', groep: 17, periode: 5, type: 'Halogeen', categorie: 'niet-metaal', r: 4, c: 16 },
    { an: 54, symbool: 'Xe', naam: 'Xenon', groep: 18, periode: 5, type: 'Edelgas', categorie: 'edelgas', r: 4, c: 17 },
    // Period 6 (skip 57-71 for now, placed in bottom rows)
    { an: 55, symbool: 'Cs', naam: 'Cesium', groep: 1, periode: 6, type: 'Alkalimetaal', categorie: 'metaal', r: 5, c: 0 },
    { an: 56, symbool: 'Ba', naam: 'Barium', groep: 2, periode: 6, type: 'Aardalkalimetaal', categorie: 'metaal', r: 5, c: 1 },
    { an: 72, symbool: 'Hf', naam: 'Hafnium', groep: 4, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 3 },
    { an: 73, symbool: 'Ta', naam: 'Tantalium', groep: 5, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 4 },
    { an: 74, symbool: 'W', naam: 'Wolfraam', groep: 6, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 5 },
    { an: 75, symbool: 'Re', naam: 'Rhenium', groep: 7, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 6 },
    { an: 76, symbool: 'Os', naam: 'Osmium', groep: 8, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 7 },
    { an: 77, symbool: 'Ir', naam: 'Iridium', groep: 9, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 8 },
    { an: 78, symbool: 'Pt', naam: 'Platina', groep: 10, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 9 },
    { an: 79, symbool: 'Au', naam: 'Goud', groep: 11, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 10 },
    { an: 80, symbool: 'Hg', naam: 'Kwik', groep: 12, periode: 6, type: 'Overgangsmetaal', categorie: 'metaal', r: 5, c: 11 },
    { an: 81, symbool: 'Tl', naam: 'Thallium', groep: 13, periode: 6, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 5, c: 12 },
    { an: 82, symbool: 'Pb', naam: 'Lood', groep: 14, periode: 6, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 5, c: 13 },
    { an: 83, symbool: 'Bi', naam: 'Bismut', groep: 15, periode: 6, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 5, c: 14 },
    { an: 84, symbool: 'Po', naam: 'Polonium', groep: 16, periode: 6, type: 'Post-overgangsmetaal', categorie: 'metaal', r: 5, c: 15 },
    { an: 85, symbool: 'At', naam: 'Astaat', groep: 17, periode: 6, type: 'Niet-metaal', categorie: 'niet-metaal', r: 5, c: 16 },
    { an: 86, symbool: 'Rn', naam: 'Radon', groep: 18, periode: 6, type: 'Edelgas', categorie: 'edelgas', r: 5, c: 17 },
    // Period 7
    { an: 87, symbool: 'Fr', naam: 'Francium', groep: 1, periode: 7, type: 'Alkalimetaal', categorie: 'metaal', r: 6, c: 0 },
    { an: 88, symbool: 'Ra', naam: 'Radium', groep: 2, periode: 7, type: 'Aardalkalimetaal', categorie: 'metaal', r: 6, c: 1 },
    { an: 104, symbool: 'Rf', naam: 'Rutherfordium', groep: 4, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 3 },
    { an: 105, symbool: 'Db', naam: 'Dubnium', groep: 5, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 4 },
    { an: 106, symbool: 'Sg', naam: 'Seaborgium', groep: 6, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 5 },
    { an: 107, symbool: 'Bh', naam: 'Bohrium', groep: 7, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 6 },
    { an: 108, symbool: 'Hs', naam: 'Hassium', groep: 8, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 7 },
    { an: 109, symbool: 'Mt', naam: 'Meitnerium', groep: 9, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 8 },
    { an: 110, symbool: 'Ds', naam: 'Darmstadtium', groep: 10, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 9 },
    { an: 111, symbool: 'Rg', naam: 'Roentgenium', groep: 11, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 10 },
    { an: 112, symbool: 'Cn', naam: 'Copernicium', groep: 12, periode: 7, type: 'Overgangsmetaal', categorie: 'metaal', r: 6, c: 11 },
    { an: 113, symbool: 'Nh', naam: 'Nihonium', groep: 13, periode: 7, type: 'Onbekend', categorie: 'metaal', r: 6, c: 12 },
    { an: 114, symbool: 'Fl', naam: 'Flerovium', groep: 14, periode: 7, type: 'Onbekend', categorie: 'metaal', r: 6, c: 13 },
    { an: 115, symbool: 'Mc', naam: 'Moscovium', groep: 15, periode: 7, type: 'Onbekend', categorie: 'metaal', r: 6, c: 14 },
    { an: 116, symbool: 'Lv', naam: 'Livermorium', groep: 16, periode: 7, type: 'Onbekend', categorie: 'metaal', r: 6, c: 15 },
    { an: 117, symbool: 'Ts', naam: 'Tennessine', groep: 17, periode: 7, type: 'Onbekend', categorie: 'metaal', r: 6, c: 16 },
    { an: 118, symbool: 'Og', naam: 'Oganesson', groep: 18, periode: 7, type: 'Edelgas', categorie: 'edelgas', r: 6, c: 17 },
    // Lanthanides (displayed at r=8, c=2 to c=16 for visual layout)
    { an: 57, symbool: 'La', naam: 'Lanthaan', groep: 3, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 2 },
    { an: 58, symbool: 'Ce', naam: 'Cerium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 3 },
    { an: 59, symbool: 'Pr', naam: 'Praseodymium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 4 },
    { an: 60, symbool: 'Nd', naam: 'Neodymium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 5 },
    { an: 61, symbool: 'Pm', naam: 'Promethium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 6 },
    { an: 62, symbool: 'Sm', naam: 'Samarium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 7 },
    { an: 63, symbool: 'Eu', naam: 'Europium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 8 },
    { an: 64, symbool: 'Gd', naam: 'Gadolinium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 9 },
    { an: 65, symbool: 'Tb', naam: 'Terbium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 10 },
    { an: 66, symbool: 'Dy', naam: 'Dysprosium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, c: 11 },
    { an: 67, symbool: 'Ho', naam: 'Holmium', groep: null, periode: 6, type: 'Lanthanide', categorie: 'metaal', r: 8, 'c': 12 },
    { an: 68, 'symbool': 'Er', 'naam': 'Erbium', 'groep': null, 'periode': 6, 'type': 'Lanthanide', 'categorie': 'metaal', 'r': 8, 'c': 13 },
    { an: 69, 'symbool': 'Tm', 'naam': 'Thulium', 'groep': null, 'periode': 6, 'type': 'Lanthanide', 'categorie': 'metaal', 'r': 8, 'c': 14 },
    { an: 70, 'symbool': 'Yb', 'naam': 'Ytterbium', 'groep': null, 'periode': 6, 'type': 'Lanthanide', 'categorie': 'metaal', 'r': 8, 'c': 15 },
    { an: 71, 'symbool': 'Lu', 'naam': 'Lutetium', 'groep': null, 'periode': 6, 'type': 'Lanthanide', 'categorie': 'metaal', 'r': 8, 'c': 16 },
    // Actinides (displayed at r=9, c=2 to c=16 for visual layout)
    { an: 89, symbool: 'Ac', naam: 'Actinium', groep: 3, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 2 },
    { an: 90, symbool: 'Th', naam: 'Thorium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 3 },
    { an: 91, symbool: 'Pa', naam: 'Protactinium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 4 },
    { an: 92, symbool: 'U', naam: 'Uranium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 5 },
    { an: 93, symbool: 'Np', naam: 'Neptunium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 6 },
    { an: 94, symbool: 'Pu', naam: 'Plutonium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 7 },
    { an: 95, symbool: 'Am', naam: 'Americium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 8 },
    { an: 96, symbool: 'Cm', naam: 'Curium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 9 },
    { an: 97, symbool: 'Bk', naam: 'Berkelium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 10 },
    { an: 98, symbool: 'Cf', naam: 'Californium', groep: null, periode: 7, type: 'Actinide', categorie: 'metaal', r: 9, c: 11 },
    { an: 99, 'symbool': 'Es', 'naam': 'Einsteinium', 'groep': null, 'periode': 7, 'type': 'Actinide', 'categorie': 'metaal', 'r': 9, 'c': 12 },
    { an: 100, 'symbool': 'Fm', 'naam': 'Fermium', 'groep': null, 'periode': 7, 'type': 'Actinide', 'categorie': 'metaal', 'r': 9, 'c': 13 },
    { an: 101, 'symbool': 'Md', 'naam': 'Mendelevium', 'groep': null, 'periode': 7, 'type': 'Actinide', 'categorie': 'metaal', 'r': 9, 'c': 14 },
    { an: 102, 'symbool': 'No', 'naam': 'Nobelium', 'groep': null, 'periode': 7, 'type': 'Actinide', 'categorie': 'metaal', 'r': 9, 'c': 15 },
    { an: 103, 'symbool': 'Lr', 'naam': 'Lawrencium', 'groep': null, 'periode': 7, 'type': 'Actinide', 'categorie': 'metaal', 'r': 9, 'c': 16 },
];

// Map for quick lookup of elements by their (row, col) coordinates
const elementsMap = new Map();
PERIODIC_TABLE_ELEMENTS.forEach(el => {
    elementsMap.set(`${el.r}-${el.c}`, el);
});

const generateElementQuestion = (element) => {
    const questionTypes = ['valentie-elektronen', 'schillen', 'type', 'groep', 'periode'];
    const questionType = Math.random() < 0.5 ? 'type' : questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let questionText = '';
    let correctAnswer = '';
    let options = [];

    switch (questionType) {
        case 'valentie-elektronen':
            let valence;
            if ([1, 2].includes(element.groep)) {
                valence = element.groep;
            } else if (element.groep >= 13 && element.groep <= 17) {
                valence = element.groep - 10;
            } else if (element.groep === 18) {
                valence = 8;
                if (element.symbool === 'He') valence = 2;
            } else {
                valence = 'variabel';
            }
            questionText = `Hoeveel valentie-elektronen heeft ${element.naam} (${element.symbool})?`;
            correctAnswer = valence.toString();
            break;
        case 'schillen':
            questionText = `Hoeveel elektronenschillen heeft ${element.naam} (${element.symbool})?`;
            correctAnswer = element.periode.toString();
            break;
        case 'type':
            // Directly use the 'categorie' property which is already simplified
            questionText = `Is ${element.naam} (${element.symbool}) een metaal, niet-metaal of edelgas?`;
            correctAnswer = element.categorie;
            // Removed 'onbekend' from options
            options = ['metaal', 'niet-metaal', 'edelgas'].sort(() => Math.random() - 0.5);
            break;
        case 'groep':
            questionText = `In welke groepsnummer bevindt ${element.naam} (${element.symbool}) zich?`;
            correctAnswer = element.groep.toString();
            break;
        case 'periode':
            questionText = `In welke periodenummer bevindt ${element.naam} (${element.symbool}) zich?`;
            correctAnswer = element.periode.toString();
            break;
        default:
            questionText = `Wat is het atoomnummer van ${element.naam} (${element.symbool})?`;
            correctAnswer = element.an.toString();
    }
    return { questionText, correctAnswer, options, questionType };
};

const Board = ({ boardData, onCellClick, isPlayerBoard = false }) => {
    const getCellContent = (r, c, cellValue) => {
        const element = elementsMap.get(`${r}-${c}`);
        let content = null;
        let baseCellClass = 'flex flex-col items-center justify-center border border-gray-300 rounded-md transition-colors duration-200 w-full h-full text-xs relative';
        let backgroundColorClass = '';
        let textColorClass = 'text-gray-800'; // Default text color
        let cursorStyle = '';
        let showSymbol = true;

        if (!element) {
            backgroundColorClass = 'bg-gray-100'; // Empty gap
            showSymbol = false;
        } else {
            if (isPlayerBoard) {
                // Player's board view
                if (cellValue === 1) { // Player's ship
                    backgroundColorClass = 'bg-blue-600';
                    textColorClass = 'text-white';
                    content = <ShipIcon />;
                } else if (cellValue === 2) { // Player's ship hit
                    backgroundColorClass = 'bg-red-500';
                    textColorClass = 'text-white';
                    content = <XIcon />;
                } else if (cellValue === 3) { // Player's board: AI missed
                    backgroundColorClass = 'bg-gray-400';
                    textColorClass = 'text-black';
                    content = <TargetIcon />;
                } else if (ALLOWED_GROUPS.has(element.groep)) {
                    backgroundColorClass = 'bg-green-100 hover:bg-green-200';
                    cursorStyle = 'cursor-pointer';
                } else {
                    backgroundColorClass = 'bg-gray-300'; // Grayed out
                }
            } else {
                // Opponent's board view (from player's perspective)
                if (cellValue === 2) { // Opponent's ship hit (by player)
                    backgroundColorClass = 'bg-red-500';
                    textColorClass = 'text-white';
                    content = <XIcon />;
                } else if (cellValue === 3) { // Player missed on opponent's board
                    backgroundColorClass = 'bg-gray-400';
                    textColorClass = 'text-black';
                    content = <TargetIcon />;
                } else if (ALLOWED_GROUPS.has(element.groep)) {
                    backgroundColorClass = 'bg-blue-100 hover:bg-blue-200';
                    cursorStyle = 'cursor-pointer';
                } else {
                    backgroundColorClass = 'bg-gray-300'; // Grayed out
                }
            }
        }
        // If no specific background color was set, use the default gray-200
        if (!backgroundColorClass) {
            backgroundColorClass = 'bg-gray-200';
        }

        return (
            <div
                key={`${r}-${c}`}
                className={`${baseCellClass} ${backgroundColorClass} ${textColorClass} ${cursorStyle}`}
                style={{ width: '50px', height: '50px' }} // Explicitly set cell size
                onClick={() => { if (cursorStyle.includes('cursor-pointer') && onCellClick) onCellClick(r, c); }}
            >
                {showSymbol && <span className="font-bold">{element?.symbool}</span>}
                {showSymbol && <span className="text-[0.5rem]">{element?.an}</span>}
                {content}
            </div>
        );
    };

    return (
        <div 
            className="grid gap-1 p-2 rounded-lg shadow-inner bg-gray-50 overflow-x-auto"
            style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 50px)` }} // Apply the 18-column grid
        >
            {Array.from({ length: BOARD_ROWS * BOARD_COLS }).map((_, index) => {
                const r = Math.floor(index / BOARD_COLS);
                const c = index % BOARD_COLS;
                const cellValue = boardData[r]?.[c];
                return getCellContent(r, c, cellValue);
            })}
        </div>
    );
};

const App = () => {
    // Game states
    const [playerBoard, setPlayerBoard] = useState(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
    const [playerAttacksView, setPlayerAttacksView] = useState(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
    const [opponentBoard, setOpponentBoard] = useState(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
    const [playerShips, setPlayerShips] = useState([]);
    const [opponentShips, setOpponentShips] = useState([]);
    const [placingShipIndex, setPlacingShipIndex] = useState(0);
    const [placingOrientation, setPlacingOrientation] = useState('horizontal');
    const [gameState, setGameState] = useState('placement');
    const [message, setMessage] = useState('Welkom! Plaats je schepen.');
    const [playerTurn, setPlayerTurn] = useState(true);

    // Quiz modal states
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState('');
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizOptions, setQuizOptions] = useState([]);
    const [currentQuizElement, setCurrentQuizElement] = useState(null);
    const [currentQuizTarget, setCurrentQuizTarget] = useState({ r: -1, c: -1 });
    const [quizInput, setQuizInput] = useState(''); // State for text input quiz

    // Feedback modal states
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);

    const initializeGame = useCallback(() => {
        setPlayerBoard(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
        setPlayerAttacksView(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
        setOpponentBoard(Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0)));
        setPlayerShips([]);
        setPlacingShipIndex(0);
        setPlacingOrientation('horizontal');
        setGameState('placement');
        setMessage('Welkom! Plaats je schepen.');
        setPlayerTurn(true);
        placeAIShips(); // AI places ships immediately
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const getGameActiveCells = useCallback(() => {
        const activeCells = [];
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const element = elementsMap.get(`${r}-${c}`);
                if (element && ALLOWED_GROUPS.has(element.groep)) {
                    activeCells.push({ r, c });
                }
            }
        }
        return activeCells;
    }, []);

    const placeAIShips = useCallback(() => {
        let aiBoard = Array(BOARD_ROWS).fill(0).map(() => Array(BOARD_COLS).fill(0));
        let aiShips = [];
        const activeCells = getGameActiveCells();

        const isValidAIPos = (r, c, board) => {
            const element = elementsMap.get(`${r}-${c}`);
            return r >= 0 && r < BOARD_ROWS &&
                   c >= 0 && c < BOARD_COLS &&
                   board[r][c] === 0 &&
                   element && ALLOWED_GROUPS.has(element.groep);
        };

        for (const shipType of SHIP_TYPES) {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 200) { // Increased attempts for better placement
                attempts++;
                const startCell = activeCells[Math.floor(Math.random() * activeCells.length)];
                const r = startCell.r;
                const c = startCell.c;
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

                let potentialPositions = [];
                let validPlacement = true;

                for (let i = 0; i < shipType.size; i++) {
                    let newR = r;
                    let newC = c;
                    if (orientation === 'horizontal') {
                        newC = c + i;
                    } else {
                        newR = r + i;
                    }
                    if (!isValidAIPos(newR, newC, aiBoard)) {
                        validPlacement = false;
                        break;
                    }
                    potentialPositions.push({ r: newR, c: newC });
                }

                if (validPlacement) {
                    potentialPositions.forEach(pos => {
                        aiBoard[pos.r][pos.c] = 1; // Mark as ship
                    });
                    aiShips.push({
                        id: `AI-${shipType.naam}-${aiShips.length}`,
                        naam: shipType.naam,
                        size: shipType.size,
                        positions: potentialPositions,
                        hits: Array(shipType.size).fill(false),
                        sunk: false
                    });
                    placed = true;
                }
            }
            if (!placed) {
                console.error(`Could not place AI ship: ${shipType.naam} after ${attempts} attempts.`);
            }
        }
        setOpponentBoard(aiBoard);
        setOpponentShips(aiShips);
    }, [getGameActiveCells]);

    const handleCellClickForPlacement = (r, c) => {
        if (gameState !== 'placement' || placingShipIndex >= SHIP_TYPES.length) return;

        const shipToPlace = SHIP_TYPES[placingShipIndex];
        let newShipPositions = [];

        for (let i = 0; i < shipToPlace.size; i++) {
            if (placingOrientation === 'horizontal') {
                newShipPositions.push({ r, c: c + i });
            } else {
                newShipPositions.push({ r: r + i, c });
            }
        }

        const currentBoard = playerBoard.map(row => [...row]);
        const isValidPlacement = newShipPositions.every(pos => {
            const element = elementsMap.get(`${pos.r}-${pos.c}`);
            return pos.r >= 0 && pos.r < BOARD_ROWS &&
                   pos.c >= 0 && pos.c < BOARD_COLS &&
                   currentBoard[pos.r][pos.c] === 0 && // Cell must be empty
                   element && ALLOWED_GROUPS.has(element.groep); // Must be in an allowed group
        });

        if (!isValidPlacement) {
            setMessage('Ongeldige plaatsing: buiten bereik, overlapt met een ander schip, of niet in een toegestane groep (1, 2, 13-18).');
            return;
        }

        const newPlayerBoard = currentBoard.map(row => [...row]);
        newShipPositions.forEach(pos => {
            newPlayerBoard[pos.r][pos.c] = 1; // Mark as ship
        });

        const newPlayerShips = [...playerShips, {
            id: `P-${shipToPlace.naam}-${placingShipIndex}`,
            naam: shipToPlace.naam,
            size: shipToPlace.size,
            positions: newShipPositions,
            hits: Array(shipToPlace.size).fill(false),
            sunk: false
        }];

        setPlayerBoard(newPlayerBoard);
        setPlayerShips(newPlayerShips);
        setPlacingShipIndex(prev => prev + 1);

        if (placingShipIndex + 1 === SHIP_TYPES.length) {
            setGameState('playing');
            setMessage("Al je schepen zijn geplaatst! Het is jouw beurt. Klik op het bord van de tegenstander om aan te vallen.");
        } else {
            setMessage(`Plaats je ${SHIP_TYPES[placingShipIndex + 1].naam} (${SHIP_TYPES[placingShipIndex + 1].size} eenheden)`);
        }
    };

    const handleCellClickForAttack = (r, c) => {
        if (gameState !== 'playing' || !playerTurn) {
            if (gameState === 'placement') setMessage("Gelieve eerst je schepen te plaatsen.");
            else if (!playerTurn) setMessage("Het is de beurt aan de AI. Even geduld.");
            return;
        }

        const element = elementsMap.get(`${r}-${c}`);
        if (!element || !ALLOWED_GROUPS.has(element.groep)) {
            setMessage("Je kunt alleen aanvallen op elementen in Groepen 1, 2, 13-18.");
            return;
        }

        // Check if the cell has already been attacked (2 for hit, 3 for miss)
        if (playerAttacksView[r][c] === 2 || playerAttacksView[r][c] === 3) {
            setMessage('Je hebt deze cel al aangevallen.');
            return;
        }

        setCurrentQuizElement(element);
        setCurrentQuizTarget({ r, c });
        const { questionText, correctAnswer, options } = generateElementQuestion(element);
        setQuizQuestion(questionText);
        setQuizAnswer(correctAnswer);
        setQuizOptions(options);
        setQuizInput(''); // Clear previous input
        setShowQuizModal(true);
    };

    const submitQuizAnswer = (playerInput) => {
        setShowQuizModal(false);

        if (!currentQuizElement) return;

        const correct = playerInput.toLowerCase().trim() === quizAnswer.toLowerCase().trim();
        let r = currentQuizTarget.r;
        let c = currentQuizTarget.c;

        let messageText = "";
        let newPlayerAttacksView = playerAttacksView.map(row => [...row]);

        if (correct) {
            let newOpponentBoard = opponentBoard.map(row => [...row]);
            let newOpponentShips = opponentShips.map(ship => ({ ...ship, positions: [...ship.positions], hits: [...ship.hits] }));

            let isHit = false;
            for (let i = 0; i < newOpponentShips.length; i++) {
                const ship = newOpponentShips[i];
                for (let j = 0; j < ship.positions.length; j++) {
                    const pos = ship.positions[j];
                    if (pos.r === r && pos.c === c) {
                        isHit = true;
                        newPlayerAttacksView[r][c] = 2; // Mark as hit
                        ship.hits[j] = true;
                        ship.sunk = ship.hits.every(h => h);
                        messageText = `Correct! Het is een RAAK op ${currentQuizElement.naam}!`;
                        break;
                    }
                }
                if (isHit) break;
            }

            if (!isHit) {
                newPlayerAttacksView[r][c] = 3; // Mark as miss
                messageText = `Correct, maar het is een MIS op ${currentQuizElement.naam}.`;
            }

            setOpponentBoard(newOpponentBoard);
            setOpponentShips(newOpponentShips);
            setPlayerAttacksView(newPlayerAttacksView);

            setFeedbackMessage(messageText);
            setFeedbackIsCorrect(true);
            setShowFeedbackModal(true);

            const allOpponentShipsSunk = newOpponentShips.every(ship => ship.sunk);
            if (allOpponentShipsSunk) {
                setMessage("Gefeliciteerd! Je hebt alle schepen van de AI gezonken! JE HEBT GEWONNEN!");
                setGameState('finished');
            }
        } else {
            messageText = `Fout! Het juiste antwoord was "${quizAnswer}". Je beurt wordt overgeslagen.`;
            setFeedbackMessage(messageText);
            setFeedbackIsCorrect(false);
            setShowFeedbackModal(true);
        }
        setCurrentQuizElement(null);
        setQuizAnswer('');
        setQuizQuestion('');
        setQuizOptions([]);
        setQuizInput('');
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        if (gameState === 'playing') {
            setPlayerTurn(false); // End player's turn
            setTimeout(aiTurn, 1000); // AI takes turn after a short delay
        }
    };

    const aiTurn = useCallback(() => {
        setMessage("De beurt is aan de AI...");

        let targetR, targetC;
        let availableCells = [];
        for(let r=0; r<BOARD_ROWS; r++) {
            for(let c=0; c<BOARD_COLS; c++) {
                const element = elementsMap.get(`${r}-${c}`);
                // AI can only attack cells that are in ALLOWED_GROUPS and haven't been attacked yet
                if (element && (playerBoard[r][c] !== 2 && playerBoard[r][c] !== 3) && ALLOWED_GROUPS.has(element.groep)) {
                    availableCells.push({r, c});
                }
            }
        }
        if (availableCells.length === 0) {
            setMessage("AI heeft geen geldige cellen meer om aan te vallen! Je wint standaard!");
            setGameState('finished');
            return;
        }

        const chosenCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        targetR = chosenCell.r;
        targetC = chosenCell.c;

        let newPlayerBoard = playerBoard.map(row => [...row]);
        let newPlayerShips = playerShips.map(ship => ({ ...ship, positions: [...ship.positions], hits: [...ship.hits] }));

        let isHit = false;
        // Check if AI hit a player's ship
        if (newPlayerBoard[targetR][targetC] === 1) {
            isHit = true;
            newPlayerBoard[targetR][targetC] = 2; // Mark as hit on player's board
            for (let i = 0; i < newPlayerShips.length; i++) {
                const ship = newPlayerShips[i];
                for (let j = 0; j < ship.positions.length; j++) {
                    const pos = ship.positions[j];
                    if (pos.r === targetR && pos.c === targetC) {
                        ship.hits[j] = true;
                        ship.sunk = ship.hits.every(h => h);
                        break;
                    }
                }
            }
            setMessage(`AI heeft je schip geraakt op ${elementsMap.get(`${targetR}-${targetC}`)?.symbool || `(${targetR},${targetC})`}!`);
        } else {
            newPlayerBoard[targetR][targetC] = 3; // Mark as miss on player's board
            setMessage(`AI miste op ${elementsMap.get(`${targetR}-${targetC}`)?.symbool || `(${targetR},${targetC})`}.`);
        }

        setPlayerBoard(newPlayerBoard);
        setPlayerShips(newPlayerShips);

        const allPlayerShipsSunk = newPlayerShips.every(ship => ship.sunk);
        if (allPlayerShipsSunk) {
            setMessage("Al je schepen zijn gezonken! AI wint!");
            setGameState('finished');
        } else {
            setPlayerTurn(true); // Player's turn again
        }
    }, [playerBoard, playerShips]); // Added playerBoard and playerShips to dependencies

    const renderGameContent = () => {
        if (gameState === 'placement') {
            return (
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-xl w-full">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Plaats Je Schepen</h2>
                    <p className="text-lg font-medium text-gray-700 text-center">{message}</p>
                    <h4 className="text-xl font-semibold text-gray-800">
                        Plaatsen: {SHIP_TYPES[placingShipIndex]?.naam} ({SHIP_TYPES[placingShipIndex]?.size} eenheden)
                    </h4>
                    <div className="flex gap-4">
                        <button
                            className={`py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md ${placingOrientation === 'horizontal' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
                            onClick={() => setPlacingOrientation('horizontal')}
                        >
                            Horizontaal
                        </button>
                        <button
                            className={`py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md ${placingOrientation === 'vertical' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
                            onClick={() => setPlacingOrientation('vertical')}
                        >
                            Verticaal
                        </button>
                    </div>
                    <p className="text-sm text-gray-700 text-center">
                        Klik op een cel op je bord om het schip te plaatsen. Schepen kunnen alleen worden geplaatst op elementen in Groepen 1, 2, 13-18.
                    </p>
                    <Board boardData={playerBoard} onCellClick={handleCellClickForPlacement} isPlayerBoard={true} />
                </div>
            );
        }

        if (gameState === 'playing' || gameState === 'finished') {
            return (
                <div className="flex flex-col items-center gap-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-2xl animate-fadeIn w-full">
                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg w-full overflow-x-auto">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Jouw Bord</h3>
                        <Board boardData={playerBoard} onCellClick={() => {}} isPlayerBoard={true} />
                    </div>

                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg w-full overflow-x-auto">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Bord Tegenstander</h3>
                        <Board boardData={playerAttacksView} onCellClick={handleCellClickForAttack} isPlayerBoard={false} />
                    </div>

                    <div className="flex flex-col items-center p-6 w-full">
                        <p className="text-lg font-medium text-gray-700 text-center">{message}</p>
                        {gameState === 'finished' && (
                            <button
                                className="py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md bg-blue-500 text-white font-bold hover:bg-blue-600 mt-4"
                                onClick={initializeGame}
                            >
                                Speel Opnieuw
                            </button>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8 drop-shadow-md">Periodiek Systeem Zeeslag</h1>
                {renderGameContent()}

                {/* Quiz Modal */}
                {showQuizModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full flex flex-col gap-4">
                            <h3 className="text-2xl font-bold text-gray-800 text-center">Quiz Tijd!</h3>
                            <p className="text-lg text-gray-700 text-center">{quizQuestion}</p>

                            {quizOptions.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-auto-fit minmax(120px,1fr) gap-3">
                                    {quizOptions.map((option) => (
                                        <button
                                            key={option}
                                            className="py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100"
                                            onClick={() => submitQuizAnswer(option)}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-md text-lg box-border focus:outline-none focus:border-blue-500 focus:shadow-blue-500/50"
                                    placeholder="Jouw antwoord"
                                    value={quizInput}
                                    onChange={(e) => setQuizInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            submitQuizAnswer(quizInput);
                                        }
                                    }}
                                />
                            )}
                            {quizOptions.length === 0 && (
                                <div className="flex justify-end gap-3">
                                    <button
                                        className="py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md bg-blue-500 text-white font-bold hover:bg-blue-600"
                                        onClick={() => submitQuizAnswer(quizInput)}
                                    >
                                        Antwoord Verzenden
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full flex flex-col gap-4 border-2 ${feedbackIsCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                            <h3 className={`text-2xl font-bold text-center ${feedbackIsCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                {feedbackIsCorrect ? 'Correct!' : 'Fout!'}
                            </h3>
                            <p className={`text-lg text-center ${feedbackIsCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                {feedbackMessage}
                            </p>
                            <button
                                className={`py-2 px-5 rounded-lg font-semibold transition-all duration-300 shadow-md text-white ${feedbackIsCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                onClick={closeFeedbackModal}
                            >
                                Doorgaan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
