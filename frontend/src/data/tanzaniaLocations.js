// Tanzania Regions and Cities for Side Hustle Location Selection

export const TANZANIA_LOCATIONS = {
  regions: [
    {
      name: 'Arusha',
      cities: ['Arusha', 'Moshi', 'Karatu', 'Monduli', 'Longido']
    },
    {
      name: 'Dar es Salaam',
      cities: ['Dar es Salaam', 'Kinondoni', 'Ilala', 'Temeke', 'Kigamboni']
    },
    {
      name: 'Dodoma',
      cities: ['Dodoma', 'Kondoa', 'Mpwapwa', 'Chamwino']
    },
    {
      name: 'Geita',
      cities: ['Geita', 'Bukombe', 'Chato', 'Mbogwe', 'Nyang\'hwale']
    },
    {
      name: 'Iringa',
      cities: ['Iringa', 'Mafinga', 'Njombe', 'Makete', 'Ludewa']
    },
    {
      name: 'Kagera',
      cities: ['Bukoba', 'Muleba', 'Karagwe', 'Biharamulo', 'Ngara']
    },
    {
      name: 'Katavi',
      cities: ['Mpanda', 'Nsimbo', 'Mlele']
    },
    {
      name: 'Kigoma',
      cities: ['Kigoma', 'Kasulu', 'Kibondo', 'Uvinza']
    },
    {
      name: 'Kilimanjaro',
      cities: ['Moshi', 'Hai', 'Siha', 'Rombo', 'Mwanga', 'Same']
    },
    {
      name: 'Lindi',
      cities: ['Lindi', 'Kilwa', 'Liwale', 'Nachingwea', 'Ruangwa']
    },
    {
      name: 'Manyara',
      cities: ['Babati', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro']
    },
    {
      name: 'Mara',
      cities: ['Musoma', 'Tarime', 'Rorya', 'Butiama', 'Serengeti']
    },
    {
      name: 'Mbeya',
      cities: ['Mbeya', 'Mbozi', 'Rungwe', 'Kyela', 'Chunya']
    },
    {
      name: 'Morogoro',
      cities: ['Morogoro', 'Kilosa', 'Gairo', 'Kilombero', 'Mvomero']
    },
    {
      name: 'Mtwara',
      cities: ['Mtwara', 'Masasi', 'Nanyumbu', 'Newala', 'Tandahimba']
    },
    {
      name: 'Mwanza',
      cities: ['Mwanza', 'Sengerema', 'Ukerewe', 'Magu', 'Misungwi']
    },
    {
      name: 'Njombe',
      cities: ['Njombe', 'Makambako', 'Wanging\'ombe', 'Ludewa']
    },
    {
      name: 'Pemba North',
      cities: ['Wete', 'Micheweni']
    },
    {
      name: 'Pemba South',
      cities: ['Chake Chake', 'Mkoani']
    },
    {
      name: 'Pwani',
      cities: ['Kibaha', 'Bagamoyo', 'Kisarawe', 'Mkuranga', 'Rufiji']
    },
    {
      name: 'Rukwa',
      cities: ['Sumbawanga', 'Nkasi', 'Kalambo']
    },
    {
      name: 'Ruvuma',
      cities: ['Songea', 'Tunduru', 'Namtumbo', 'Nyasa', 'Mbinga']
    },
    {
      name: 'Shinyanga',
      cities: ['Shinyanga', 'Kahama', 'Kishapu', 'Meatu']
    },
    {
      name: 'Simiyu',
      cities: ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu']
    },
    {
      name: 'Singida',
      cities: ['Singida', 'Iramba', 'Manyoni', 'Ikungi', 'Mkalama']
    },
    {
      name: 'Songwe',
      cities: ['Vwawa', 'Mbozi', 'Momba']
    },
    {
      name: 'Tabora',
      cities: ['Tabora', 'Urambo', 'Nzega', 'Igunga', 'Uyui']
    },
    {
      name: 'Tanga',
      cities: ['Tanga', 'Pangani', 'Handeni', 'Korogwe', 'Lushoto']
    },
    {
      name: 'Unguja North',
      cities: ['Mkokotoni', 'Nungwi']
    },
    {
      name: 'Unguja South',
      cities: ['Koani', 'Kizimkazi']
    },
    {
      name: 'Unguja Urban/West',
      cities: ['Zanzibar City', 'Mtoni', 'Bububu']
    }
  ]
};

// Helper function to get all locations as flat array
export const getAllLocations = () => {
  const locations = [];
  TANZANIA_LOCATIONS.regions.forEach(region => {
    region.cities.forEach(city => {
      locations.push({
        value: `${city}, ${region.name}`,
        label: `${city}, ${region.name}`,
        city: city,
        region: region.name
      });
    });
  });
  return locations.sort((a, b) => a.label.localeCompare(b.label));
};

// Helper function to get regions only
export const getRegions = () => {
  return TANZANIA_LOCATIONS.regions.map(r => ({
    value: r.name,
    label: r.name
  }));
};

// Helper function to get cities for a region
export const getCitiesForRegion = (regionName) => {
  const region = TANZANIA_LOCATIONS.regions.find(r => r.name === regionName);
  return region ? region.cities.map(city => ({
    value: `${city}, ${regionName}`,
    label: city
  })) : [];
};

