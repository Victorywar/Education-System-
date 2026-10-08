export const builderThemes = [
  {
    id: 'skyscraper',
    label: 'Skyscraper',
    title: 'Modern High-Rise Construction',
    icon: '🏢',
    phases: [
      'Deep foundation & piling',
      'Concrete slab & rebar grid',
      'Steel columns & I-beam framing',
      'Floor slabs & elevator shaft',
      'Brick masonry & MEP conduits',
      'Double-glazed curtain wall facade',
      'Interior lighting & acoustic ceilings',
      'Rooftop deck & HVAC chillers',
      'Architectural crown & spire',
      'Grand opening illumination & golden certificate unveiling',
    ],
  },
  {
    id: 'bicycle',
    label: 'Precision Bicycle',
    title: 'Precision Mechanical Bicycle Crafting',
    icon: '🚲',
    phases: [
      'Tubular alloy frame welding',
      'Bottom bracket & pedal crankset',
      'Front fork & steering headset',
      'Spoked wheel truing & hubs',
      'High-pressure tires & inner tubes',
      'Chaindrive & derailleur gears',
      'Caliper brakes & tension cables',
      'Drop handlebars & grip wrap',
      'Saddle post & LED dynamo headlight',
      'Final road-ready test run & badge inspection',
    ],
  },
  {
    id: 'bridge',
    label: 'Bridge of Empathy',
    title: 'The Bridge of Empathy - Helping Hand Journey',
    icon: '🤝',
    phases: [
      'Riverbank geotechnical survey',
      'Caisson foundation in water',
      'Twin stone support pylons',
      'Steel suspension anchor cables',
      'Transverse floor beams',
      'Hardwood timber deck laying',
      'Safety handrails & guard wire',
      'Lantern posts illumination',
      'Approaching traveler meeting midpoint',
      'The Helping Hand handshake connection complete',
    ],
  },
];

export const getBuilderTheme = (themeId) =>
  builderThemes.find((theme) => theme.id === themeId) || builderThemes[0];

export const getPreferredBuilderTheme = (skillId) => {
  const storedTheme = window.localStorage.getItem(`student_craft_theme_${skillId}`);
  return getBuilderTheme(storedTheme).id;
};
