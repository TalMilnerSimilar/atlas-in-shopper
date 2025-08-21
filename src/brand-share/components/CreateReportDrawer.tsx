import React, { useEffect, useRef, useState } from 'react';

interface CreateReportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (report: { title: string; category: string; brand: string; competitors: string[] }) => void;
}

// Build a domain-specific catalog with different categories per level
const LEVEL1: string[] = [
  'Electronics',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Clothing, Shoes & Jewelry',
  'Health & Household',
  'Grocery & Gourmet Food',
  'Pet Supplies',
  'Tools & Home Improvement',
  'Office Products',
  'Baby',
  'Industrial & Scientific',
  'Books',
  'Music',
  'Movies & TV'
];

// Level 2 options differ per L1
const LEVEL2_BY_L1: Record<string, string[]> = {
  Electronics: ['Accessories & Supplies','Audio & Video','Camera & Photo','Smart Home','Wearables','Components','Computers & Tablets'],
  'Home & Kitchen': ['Appliances','Furniture','Décor','Storage & Organization','Cleaning & Care','Bedding','Kitchen & Dining'],
  'Beauty & Personal Care': ['Makeup','Skin Care','Hair Care','Tools & Accessories','Fragrance'],
  'Sports & Outdoors': ['Exercise & Fitness','Camping & Hiking','Cycling','Water Sports','Team Sports'],
  'Toys & Games': ['STEM Toys','Puzzles','Board Games','Dolls & Accessories','Action Figures'],
  Automotive: ['Car Electronics','Exterior Accessories','Interior Accessories','Car Care','Motorcycle & Powersports'],
  'Clothing, Shoes & Jewelry': ['Men','Women','Kids','Shoes','Jewelry'],
  'Health & Household': ['Vitamins','Wellness','Medical Supplies','Household Supplies','Baby & Child Care'],
  'Grocery & Gourmet Food': ['Snacks','Beverages','Pantry Staples','Breakfast Foods','Sauces & Condiments'],
  'Pet Supplies': ['Dog','Cat','Fish & Aquatic','Small Animals','Birds'],
  'Tools & Home Improvement': ['Hand Tools','Power Tools','Lighting','Electrical','Hardware'],
  'Office Products': ['Desk Accessories','Paper','Writing & Correction','Organization','Office Electronics'],
  Baby: ['Nursery','Feeding','Diapering','Bathing','Gear'],
  'Industrial & Scientific': ['Lab & Test','Measurement','Packaging','Material Handling','Safety'],
  Books: ["Literature & Fiction","Children's Books","Education & Teaching","Business & Money","Mystery & Thriller"],
  Music: ['CDs & Vinyl','Digital Music','Instruments','Accessories'],
  'Movies & TV': ['Blu-ray','DVD','Streaming','TV Series','Documentary']
};

// Level 3 options differ per L1+L2 (sparse mapping; others may have fewer levels)
const LEVEL3_BY_L1L2: Record<string, string[]> = {
  'Electronics|Accessories & Supplies': ['Cables & Adapters','Batteries & Chargers','Mounts & Stands','Cases & Covers','Screen Protectors'],
  'Electronics|Audio & Video': ['Headphones','Speakers','Soundbars','Microphones','AV Receivers'],
  'Electronics|Camera & Photo': ['Lenses','Tripods','Camera Bags','Lighting','Memory Cards'],
  'Electronics|Smart Home': ['Smart Switches','Smart Bulbs','Thermostats','Cameras','Hubs'],
  'Electronics|Wearables': ['Smartwatches','Fitness Trackers','VR Headsets','Wearable Accessories'],
  'Electronics|Components': ['CPUs','Motherboards','Memory','SSDs','GPUs'],
  'Electronics|Computers & Tablets': ['Laptops','Desktops','Tablets','Monitors','Keyboards'],

  'Home & Kitchen|Appliances': ['Air Fryers','Coffee Makers','Blenders','Microwaves','Robot Vacuums'],
  'Home & Kitchen|Furniture': ['Sofas','Dining Sets','Office Chairs','Beds','TV Stands'],
  'Home & Kitchen|Décor': ['Wall Art','Rugs','Curtains','Mirrors','Vases'],
  'Home & Kitchen|Storage & Organization': ['Stackable Bins','Drawer Organizers','Closet Systems','Shelving Units','Laundry Baskets'],
  'Home & Kitchen|Bedding': ['Duvet Covers','Pillowcases','Sheets','Comforters','Blankets'],
  'Home & Kitchen|Kitchen & Dining': ['Cookware','Knife Sets','Dinnerware','Bakeware','Utensils'],

  'Beauty & Personal Care|Makeup': ['Face','Eyes','Lips','Makeup Tools'],
  'Beauty & Personal Care|Skin Care': ['Cleansers','Moisturizers','Serums','Masks','Sunscreens'],
  'Beauty & Personal Care|Hair Care': ['Shampoo','Conditioner','Styling','Treatments'],

  'Sports & Outdoors|Exercise & Fitness': ['Treadmills','Dumbbells','Yoga','Resistance Bands','Exercise Bikes'],
  'Sports & Outdoors|Camping & Hiking': ['Tents','Sleeping Bags','Backpacks','Camp Kitchen'],
  'Sports & Outdoors|Cycling': ['Helmets','Bike Pumps','Lights','Locks'],

  'Toys & Games|STEM Toys': ['Science Kits','Building Sets','Robotics'],
  'Toys & Games|Board Games': ['Strategy','Family','Party Games'],

  'Automotive|Car Electronics': ['Dash Cams','Car Stereos','GPS Units','OBD Scanners'],
  'Automotive|Interior Accessories': ['Seat Covers','Floor Mats','Organizers','Sun Shades'],
  'Automotive|Car Care': ['Wash','Wax','Detailing Tools'],

  'Clothing, Shoes & Jewelry|Men': ['Tops','Bottoms','Outerwear','Underwear','Accessories'],
  'Clothing, Shoes & Jewelry|Women': ['Dresses','Tops','Bottoms','Outerwear','Handbags'],
  'Clothing, Shoes & Jewelry|Kids': ['Boys Clothing','Girls Clothing','Baby Clothing','Shoes','Accessories'],
  'Clothing, Shoes & Jewelry|Shoes': ['Running','Casual','Boots','Sandals','Dress'],
  'Clothing, Shoes & Jewelry|Jewelry': ['Necklaces','Earrings','Rings','Bracelets','Watches'],

  'Health & Household|Vitamins': ['Multivitamins','Vitamin D','Vitamin C','Probiotics'],
  'Health & Household|Wellness': ['Sleep','Stress Relief','Fitness Supplements'],
  'Health & Household|Medical Supplies': ['Bandages','Thermometers','Gloves','First Aid Kits'],

  'Grocery & Gourmet Food|Snacks': ['Chips','Protein Bars','Nuts & Seeds','Cookies'],
  'Grocery & Gourmet Food|Beverages': ['Coffee','Tea','Juice','Sparkling Water'],

  'Pet Supplies|Dog': ['Food','Treats','Leashes & Collars','Beds'],
  'Pet Supplies|Cat': ['Food','Litter','Toys','Trees & Scratching'],

  'Tools & Home Improvement|Hand Tools': ['Screwdrivers','Hammers','Wrenches','Measuring'],
  'Tools & Home Improvement|Power Tools': ['Cordless Drills','Impact Drivers','Saws','Sanders'],

  'Office Products|Desk Accessories': ['Organizers','Monitor Stands','Mousepads','Cable Management'],
  'Office Products|Paper': ['Notebooks','Printer Paper','Sticky Notes','Index Cards'],

  'Baby|Nursery': ['Cribs','Mattresses','Monitors','Bedding'],
  'Baby|Feeding': ['Bottles','Breastfeeding','Highchairs','Sterilizers'],

  'Industrial & Scientific|Lab & Test': ['Microscopes','Pipettes','Centrifuges','Lab Glassware'],
  'Industrial & Scientific|Measurement': ['Digital Calipers','Multimeters','Scales','Thermometers'],

  'Books|Literature & Fiction': ['Classics','Contemporary','Historical','Science Fiction'],
  "Books|Children's Books": ['Picture Books','Early Readers','Chapter Books','Young Adult'],
  'Music|Instruments': ['Guitars','Keyboards','Drums','Studio Gear'],
  'Movies & TV|TV Series': ['Drama','Comedy','Sci-Fi','Documentary']
};

// Level 4 options differ per L1+L2+L3 (sparse; used where it adds clarity)
const LEVEL4_BY_L1L2L3: Record<string, string[]> = {
  'Electronics|Audio & Video|Headphones': ['Over-Ear','In-Ear','On-Ear','Noise-Cancelling'],
  'Electronics|Audio & Video|Speakers': ['Bookshelf','Floorstanding','Portable','Soundbars'],
  'Electronics|Accessories & Supplies|Cables & Adapters': ['HDMI','USB-C','DisplayPort','Audio'],
  'Electronics|Camera & Photo|Lenses': ['Prime','Zoom','Wide Angle','Telephoto'],
  'Home & Kitchen|Appliances|Coffee Makers': ['Drip','Espresso','Single-Serve','French Press'],
  'Clothing, Shoes & Jewelry|Shoes|Running': ['Road','Trail','Racing','Stability'],
  'Sports & Outdoors|Exercise & Fitness|Yoga': ['Mats','Blocks','Straps','Wheels'],
  'Grocery & Gourmet Food|Beverages|Coffee': ['Whole Bean','Ground','Pods','Instant'],
  'Pet Supplies|Dog|Food': ['Dry','Wet','Freeze-Dried','Grain-Free'],
  'Tools & Home Improvement|Power Tools|Saws': ['Circular','Jigsaw','Miter','Table'],
  'Office Products|Paper|Notebooks': ['Spiral','Hardcover','Softcover','Dot Grid'],
  'Baby|Nursery|Cribs': ['Convertible','Mini','Portable','Standard']
};

function buildCategoryList(maxCount: number): string[] {
  const list: string[] = [];
  const seen = new Set<string>();

  const add = (s: string) => {
    if (!seen.has(s)) {
      list.push(s);
      seen.add(s);
      return list.length >= maxCount;
    }
    return false;
  };

  for (const l1 of LEVEL1) {
    if (add(l1)) return list.slice(0, maxCount);
    const l2s = LEVEL2_BY_L1[l1] || [];
    for (const l2 of l2s) {
      if (add(`${l1} > ${l2}`)) return list.slice(0, maxCount);
      const key2 = `${l1}|${l2}`;
      const l3s = LEVEL3_BY_L1L2[key2] || [];
      for (const l3 of l3s) {
        if (add(`${l1} > ${l2} > ${l3}`)) return list.slice(0, maxCount);
        const key3 = `${key2}|${l3}`;
        const l4s = LEVEL4_BY_L1L2L3[key3] || [];
        for (const l4 of l4s) {
          if (add(`${l1} > ${l2} > ${l3} > ${l4}`)) return list.slice(0, maxCount);
        }
      }
    }
  }

  return list.slice(0, maxCount);
}

const allCategories: string[] = buildCategoryList(200);

// Mock brand list - 400 brands across various categories
const brandsMock: string[] = [
  // Tech & Electronics
  'Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Google', 'Amazon', 'Dell', 'HP', 'Lenovo',
  'ASUS', 'Acer', 'MSI', 'Intel', 'AMD', 'NVIDIA', 'Corsair', 'Logitech', 'Razer', 'SteelSeries',
  'Canon', 'Nikon', 'Fujifilm', 'Olympus', 'Panasonic', 'JBL', 'Bose', 'Beats', 'Audio-Technica', 'Sennheiser',
  'Philips', 'TCL', 'Hisense', 'Vizio', 'Roku', 'Xiaomi', 'Huawei', 'OnePlus', 'Oppo', 'Vivo',
  
  // Fashion & Apparel
  'Nike', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Converse', 'Vans', 'Reebok', 'ASICS', 'Skechers',
  'H&M', 'Zara', 'Uniqlo', 'Gap', 'Old Navy', 'Forever 21', 'Primark', 'Target', 'Walmart', 'Costco',
  'Levi\'s', 'Wrangler', 'Lee', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren', 'Lacoste', 'Hugo Boss', 'Armani', 'Gucci',
  'Prada', 'Louis Vuitton', 'Chanel', 'Hermès', 'Burberry', 'Versace', 'Dolce & Gabbana', 'Fendi', 'Balenciaga', 'Givenchy',
  
  // Beauty & Personal Care
  'L\'Oréal', 'Maybelline', 'Revlon', 'CoverGirl', 'MAC', 'Estée Lauder', 'Clinique', 'Lancôme', 'Dior', 'Chanel',
  'NIVEA', 'Dove', 'Olay', 'Neutrogena', 'CeraVe', 'Cetaphil', 'Aveeno', 'Eucerin', 'La Roche-Posay', 'Vichy',
  'Head & Shoulders', 'Pantene', 'Herbal Essences', 'TRESemmé', 'Garnier', 'Schwarzkopf', 'Matrix', 'Redken', 'Paul Mitchell', 'Aveda',
  'Gillette', 'Schick', 'Braun', 'Oral-B', 'Colgate', 'Crest', 'Listerine', 'Sensodyne', 'Aquafresh', 'TheraBreath',
  
  // Food & Beverages
  'Coca-Cola', 'Pepsi', 'Dr Pepper', 'Sprite', 'Fanta', 'Mountain Dew', 'Red Bull', 'Monster', 'Rockstar', 'Bang',
  'Starbucks', 'Dunkin\'', 'Tim Hortons', 'Costa Coffee', 'Nescafé', 'Folgers', 'Maxwell House', 'Lavazza', 'Illy', 'Peet\'s',
  'McDonald\'s', 'Burger King', 'KFC', 'Subway', 'Pizza Hut', 'Domino\'s', 'Taco Bell', 'Wendy\'s', 'Chick-fil-A', 'Chipotle',
  'Heinz', 'Kraft', 'Nestlé', 'Unilever', 'General Mills', 'Kellogg\'s', 'Post', 'Quaker', 'Campbell\'s', 'Progresso',
  
  // Home & Garden
  'IKEA', 'Home Depot', 'Lowe\'s', 'Wayfair', 'Ashley Furniture', 'La-Z-Boy', 'Pottery Barn', 'West Elm', 'Crate & Barrel', 'Williams Sonoma',
  'KitchenAid', 'Cuisinart', 'Hamilton Beach', 'Black+Decker', 'Ninja', 'Vitamix', 'Instant Pot', 'Crock-Pot', 'Keurig', 'Nespresso',
  'Dyson', 'Shark', 'Bissell', 'Hoover', 'Roomba', 'Miele', 'Electrolux', 'Whirlpool', 'GE', 'Frigidaire',
  'Scotts', 'Miracle-Gro', 'Roundup', 'Ortho', 'Bayer', 'DeWalt', 'Makita', 'Milwaukee', 'Ryobi', 'Craftsman',
  
  // Automotive
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Nissan', 'Hyundai',
  'Kia', 'Mazda', 'Subaru', 'Lexus', 'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC',
  'Jeep', 'Ram', 'Dodge', 'Chrysler', 'Tesla', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Ferrari',
  'Michelin', 'Bridgestone', 'Goodyear', 'Continental', 'Pirelli', 'Dunlop', 'Yokohama', 'Cooper', 'Hankook', 'Toyo',
  
  // Sports & Fitness
  'Spalding', 'Wilson', 'Rawlings', 'Easton', 'Louisville Slugger', 'Titleist', 'Callaway', 'TaylorMade', 'Ping', 'Cobra',
  'Yeti', 'Coleman', 'The North Face', 'Patagonia', 'Columbia', 'REI', 'Dick\'s Sporting Goods', 'Sports Authority', 'Big 5', 'Modell\'s',
  'Peloton', 'NordicTrack', 'Bowflex', 'Schwinn', 'Life Fitness', 'Precor', 'Nautilus', 'Sole', 'ProForm', 'Horizon',
  'Gatorade', 'Powerade', 'BodyArmor', 'Vitamin Water', 'Smartwater', 'Fiji', 'Evian', 'Perrier', 'San Pellegrino', 'LaCroix',
  
  // Healthcare & Pharmacy
  'Johnson & Johnson', 'Pfizer', 'Merck', 'Bristol Myers Squibb', 'AbbVie', 'Novartis', 'Roche', 'Sanofi', 'GlaxoSmithKline', 'AstraZeneca',
  'CVS', 'Walgreens', 'Rite Aid', 'Duane Reade', 'Boots', 'Shoppers Drug Mart', 'Rexall', 'Pharmaprix', 'Jean Coutu', 'Familiprix',
  'Band-Aid', 'Neosporin', 'Benadryl', 'Tylenol', 'Advil', 'Motrin', 'Aleve', 'Aspirin', 'Pepto-Bismol', 'Imodium',
  'Claritin', 'Zyrtec', 'Allegra', 'Flonase', 'Nasacort', 'Sudafed', 'Robitussin', 'Delsym', 'Mucinex', 'Halls',
  
  // Retail & E-commerce
  'Amazon Basics', 'Walmart Great Value', 'Target Good & Gather', 'Costco Kirkland', 'Sam\'s Choice', 'Member\'s Mark', 'Up & Up', 'Simply Balanced', 'Market Pantry', 'Archer Farms',
  'Best Buy Insignia', 'Home Depot Husky', 'Lowe\'s Kobalt', 'Sears Kenmore', 'Macy\'s', 'Nordstrom', 'Bloomingdale\'s', 'Saks Fifth Avenue', 'Neiman Marcus', 'Barneys',
  'TJ Maxx', 'Marshall\'s', 'Nordstrom Rack', 'Saks OFF 5TH', 'Outlet', 'Burlington', 'Ross', 'Big Lots', 'Dollar Tree', 'Family Dollar',
  'eBay', 'Etsy', 'Shopify', 'Square', 'PayPal', 'Stripe', 'Alibaba', 'AliExpress', 'Wish', 'Overstock',
  
  // Generic & Store Brands
  'Generic', 'Store Brand', 'Private Label', 'No Name', 'President\'s Choice', 'Our Brand', 'Value', 'Essential', 'Basic', 'Select',
  'Premium', 'Signature', 'Choice', 'First Rate', 'Top Care', 'Smart Sense', 'Well at Walgreens', 'CVS Health', 'Rite Aid', 'Good Sense'
];

// Function to suggest competitors based on selected brand
const getSuggestedCompetitors = (brand: string): string[] => {
  // Create category-based competitor suggestions
  const competitorMap: Record<string, string[]> = {
    // Tech & Electronics
    'Apple': ['Samsung', 'Google', 'Microsoft', 'Sony'],
    'Samsung': ['Apple', 'LG', 'Sony', 'Xiaomi'],
    'Google': ['Apple', 'Microsoft', 'Amazon', 'Samsung'],
    'Microsoft': ['Apple', 'Google', 'Amazon', 'Sony'],
    'Sony': ['Samsung', 'LG', 'Panasonic', 'Canon'],
    'Amazon': ['Google', 'Microsoft', 'Apple', 'Walmart'],
    
    // Fashion & Apparel
    'Nike': ['Adidas', 'Puma', 'Under Armour', 'New Balance'],
    'Adidas': ['Nike', 'Puma', 'Under Armour', 'Reebok'],
    'Puma': ['Nike', 'Adidas', 'Under Armour', 'New Balance'],
    'H&M': ['Zara', 'Uniqlo', 'Forever 21', 'Gap'],
    'Zara': ['H&M', 'Uniqlo', 'Gap', 'Forever 21'],
    
    // Beauty & Personal Care
    'L\'Oréal': ['Maybelline', 'Revlon', 'CoverGirl', 'Estée Lauder'],
    'NIVEA': ['Dove', 'Olay', 'Neutrogena', 'CeraVe'],
    'Gillette': ['Schick', 'Braun', 'Philips', 'Oral-B'],
    
    // Food & Beverages
    'Coca-Cola': ['Pepsi', 'Dr Pepper', 'Sprite', 'Fanta'],
    'Pepsi': ['Coca-Cola', 'Dr Pepper', 'Mountain Dew', 'Sprite'],
    'McDonald\'s': ['Burger King', 'KFC', 'Subway', 'Wendy\'s'],
    'Starbucks': ['Dunkin\'', 'Tim Hortons', 'Costa Coffee', 'Peet\'s'],
    
    // Automotive
    'Toyota': ['Honda', 'Ford', 'Chevrolet', 'Nissan'],
    'BMW': ['Mercedes-Benz', 'Audi', 'Lexus', 'Acura'],
    'Tesla': ['BMW', 'Mercedes-Benz', 'Audi', 'Lucid'],
  };

  // Get suggested competitors or fallback to random selection
  let suggested = competitorMap[brand];
  if (!suggested) {
    // Fallback: pick random brands from the same general category
    const shuffled = [...brandsMock].filter(b => b !== brand).sort(() => 0.5 - Math.random());
    suggested = shuffled.slice(0, 4);
  }
  
  return suggested;
};

const CreateReportDrawer: React.FC<CreateReportDrawerProps> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [search, setSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  // Preserve the first suggested list so returning from manual shows the same initial suggestions
  const [initialSuggestedCompetitors, setInitialSuggestedCompetitors] = useState<string[]>([]);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSearch('');
      setBrandSearch('');
      setCompetitorSearch('');
      setSelectedCategory('');
      setSelectedBrand('');
      setSelectedCompetitors([]);
      setInitialSuggestedCompetitors([]);
      setIsManualSelection(false);
    }
  }, [isOpen]);

  // Auto-advance to step 2 when category is selected
  useEffect(() => {
    if (selectedCategory && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedCategory, currentStep]);

  // Auto-advance to step 3 when brand is selected, and suggest competitors
  useEffect(() => {
    if (selectedBrand && currentStep === 2) {
      setCurrentStep(3);
      // Suggest competitors based on the selected brand
      const suggestedCompetitors = getSuggestedCompetitors(selectedBrand);
      setSelectedCompetitors(suggestedCompetitors);
      setInitialSuggestedCompetitors(suggestedCompetitors);
    }
  }, [selectedBrand, currentStep]);

  const filteredCategories = allCategories.filter((c) =>
    c.toLowerCase().includes(search.trim().toLowerCase())
  );

  const filteredBrands = brandsMock.filter((b) =>
    b.toLowerCase().includes(brandSearch.trim().toLowerCase())
  );

  const filteredCompetitors = brandsMock
    .filter((b) => b !== selectedBrand) // Exclude the selected brand
    .filter((b) => b.toLowerCase().includes(competitorSearch.trim().toLowerCase()));

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Save enabled when category, brand, and at least one competitor are selected
  const canSave = Boolean(selectedCategory && selectedBrand && selectedCompetitors.length > 0);

  const getDerivedTitle = (): string => {
    if (selectedCategory) {
      const parts = selectedCategory.split('>');
      const last = parts[parts.length - 1]?.trim();
      if (last) return last;
    }
    return 'New Report';
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[10020] transition ${isOpen ? 'pointer-events-auto bg-black/30' : 'pointer-events-none bg-transparent'}`}
      onClick={handleOverlayClick}
      aria-hidden={!isOpen}
    >
      <aside
        className={`fixed right-0 top-0 h-full w-[700px] bg-white border-l border-[#e6e9ec] shadow-[0px_1px_8px_0px_rgba(9,37,64,0.08),0px_5px_24px_0px_rgba(9,37,64,0.08)] transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h2 className="text-[24px] leading-6 font-normal font-dm-sans text-[#092540] mr-4">Create New Report</h2>
          <button
            aria-label="Close"
            className="w-10 h-10 rounded-full hover:bg-[#f3f7ff] active:bg-[#e8eeff] flex items-center justify-center"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5l10 10M15 5L5 15" stroke="#3A5166" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bg-[#f7f7f8] h-[calc(100%-160px)] overflow-auto px-8 py-4">
          
          {/* Step 1 - Category (completed if step > 1) */}
          {currentStep > 1 ? (
            <div className="bg-white rounded-lg p-6 mb-6 flex items-center justify-between hover:shadow-[0px_1px_8px_0px_rgba(9,37,64,0.03),0px_5px_24px_0px_rgba(9,37,64,0.06)] transition-shadow cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="w-6 h-6 relative">
                  {/* Default finished step icon */}
                  <img 
                    className="group-hover:opacity-0 transition-opacity w-6 h-6" 
                    src="/finished step icon.svg" 
                    alt="Completed step"
                  />
                  {/* Edit icon on hover */}
                  <img 
                    className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" 
                    src="/edit step icon.svg" 
                    alt="Edit step"
                  />
                </div>
                <div className="text-[20px] leading-[28px] text-[#092540] font-dm-sans">Select your Category</div>
              </div>
              {/* Open Step button on hover */}
              <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white border border-[#195afe] text-[#195afe] text-[14px] leading-[20px] font-medium font-dm-sans rounded-[18px] hover:bg-[#f3f7ff]"
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedCategory('');
                }}>
                Open Step
              </button>
            </div>
          ) : (
            /* Step 1 - Category (active) */
            <div className="bg-white rounded-lg shadow-[0px_1px_8px_0px_rgba(9,37,64,0.08),0px_5px_24px_0px_rgba(9,37,64,0.08)] p-6 mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#3E74FE] text-white text-[14px] leading-[20px] flex items-center justify-center">1</div>
                <div className="text-[20px] leading-[28px] text-[#092540] font-dm-sans">Select your Category</div>
              </div>
              <div className="text-[14px] leading-[20px] text-[#092540] mb-3 font-dm-sans">Search or browse to set the base category for this report.</div>

              <div className="relative border border-[#cbd1d7] rounded-[3px] shadow-[0px_3px_5px_0px_rgba(42,62,82,0.12)]">
                <div className="flex items-center h-10 px-4 gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm6 2-3.2-3.2" stroke="#B6BEC6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    className="flex-1 outline-none text-[14px] leading-[20px] placeholder-[#b6bec6] text-[#3a5166]"
                    placeholder="Search or select your category"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="h-px bg-[#3E74FE]" />

                <div className="max-h-60 overflow-auto py-1">
                  {filteredCategories.length === 0 && (
                    <div className="px-4 py-2 text-[14px] text-[#6b7c8c]">No results</div>
                  )}
                  {filteredCategories.map((c) => (
                    <button
                      key={c}
                      className={`w-full text-left h-11 px-4 hover:bg-[#f7f7f8] ${
                        selectedCategory === c ? 'bg-[#eef2ff]' : ''
                      }`}
                      onClick={() => setSelectedCategory(c)}
                    >
                      <span className="text-[14px] leading-[20px] text-[#092540]">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Brand (completed if step > 2) */}
          {currentStep > 2 ? (
            <div className="bg-white rounded-lg p-6 mb-6 flex items-center justify-between hover:shadow-[0px_1px_8px_0px_rgba(9,37,64,0.03),0px_5px_24px_0px_rgba(9,37,64,0.06)] transition-shadow cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="w-6 h-6 relative">
                  {/* Default finished step icon */}
                  <img 
                    className="group-hover:opacity-0 transition-opacity w-6 h-6" 
                    src="/finished step icon.svg" 
                    alt="Completed step"
                  />
                  {/* Edit icon on hover */}
                  <img 
                    className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" 
                    src="/edit step icon.svg" 
                    alt="Edit step"
                  />
                </div>
                <div className="text-[20px] leading-[28px] text-[#092540] font-dm-sans">Select your Brand</div>
              </div>
              {/* Open Step button on hover */}
              <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white border border-[#195afe] text-[#195afe] text-[14px] leading-[20px] font-medium font-dm-sans rounded-[18px] hover:bg-[#f3f7ff]"
                onClick={() => {
                  setCurrentStep(2);
                  setSelectedBrand('');
                }}>
                Open Step
              </button>
            </div>
          ) : currentStep >= 2 ? (
            /* Step 2 - Brand (active) */
            <div className="bg-white rounded-lg shadow-[0px_1px_8px_0px_rgba(9,37,64,0.08),0px_5px_24px_0px_rgba(9,37,64,0.08)] p-6 mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#3E74FE] text-white text-[14px] leading-[20px] flex items-center justify-center">2</div>
                <div className="text-[20px] leading-[28px] text-[#092540] font-dm-sans">Select your Brand</div>
              </div>
              <div className="text-[14px] leading-[20px] text-[#092540] mb-3 font-dm-sans">Choose the brand you want to analyze in this report.</div>

              <div className="mb-1">
                <div className="text-[14px] leading-[20px] text-[#6b7c8c] font-dm-sans">Brand:</div>
              </div>
              <div className="relative border border-[#cbd1d7] rounded-[3px] shadow-[0px_3px_5px_0px_rgba(42,62,82,0.12)]">
                <div className="flex items-center h-10 px-4 gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm6 2-3.2-3.2" stroke="#B6BEC6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    className="flex-1 outline-none text-[14px] leading-[20px] placeholder-[#b6bec6] text-[#3a5166]"
                    placeholder="Search or select your brand"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>
                <div className="h-px bg-[#3E74FE]" />

                <div className="max-h-60 overflow-auto py-1">
                  {filteredBrands.length === 0 && (
                    <div className="px-4 py-2 text-[14px] text-[#6b7c8c]">No results</div>
                  )}
                  {filteredBrands.map((b) => (
                    <button
                      key={b}
                      className={`w-full text-left h-11 px-4 hover:bg-[#f7f7f8] ${
                        selectedBrand === b ? 'bg-[#eef2ff]' : ''
                      }`}
                      onClick={() => setSelectedBrand(b)}
                    >
                      <span className="text-[14px] leading-[20px] text-[#092540]">{b}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Step 2 - Brand (disabled placeholder) */
            <div className="bg-white rounded-lg p-6 mb-4 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-[#cbd1d7] text-white text-[14px] leading-[20px] flex items-center justify-center">2</div>
              <div className="text-[20px] leading-[28px] text-[#b6bec6] font-dm-sans">Select your Brand</div>
            </div>
          )}

          {/* Step 3 - Competitors (active when step >= 3) */}
          {currentStep >= 3 ? (
            <div className="bg-white rounded-lg shadow-[0px_1px_8px_0px_rgba(9,37,64,0.08),0px_5px_24px_0px_rgba(9,37,64,0.08)] p-6 mb-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#3E74FE] text-white text-[14px] leading-[20px] flex items-center justify-center">3</div>
                <div className="text-[20px] leading-[28px] text-[#092540] font-dm-sans">Select Competitors</div>
              </div>
              <div className="text-[14px] leading-[20px] text-[#092540] mb-4 font-dm-sans">
                We’ve selected category leaders based on your brand. You can edit them to select any competitors you want manually
              </div>

              {!isManualSelection ? (
                /* Category Leaders View */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] leading-[22px] text-[#092540] font-bold font-dm-sans">
                      Category Leaders
                    </div>
                    <button
                      className="flex items-center gap-1 px-1 py-1 text-[14px] leading-[20px] text-[#195afe] hover:text-[#1448cc] font-dm-sans"
                      onClick={() => {
                        // Enter manual mode with an empty selection, while preserving initialSuggestedCompetitors
                        setSelectedCompetitors([]);
                        setIsManualSelection(true);
                      }}
                    >
                      Edit
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="bg-[#f7f7f8] border border-[#e6e9ec] rounded p-4 min-h-[100px] flex flex-wrap items-center gap-2 content-center">
                    {selectedCompetitors.map((competitor) => (
                      <div
                        key={competitor}
                        style={{ height: '32px' }}
                        className="inline-flex items-center justify-start gap-2 px-3 py-1 bg-white rounded-[40px] shadow-[0px_3px_5px_rgba(42,62,82,0.12)]"
                      >
                        <span className="text-[12px] leading-[16px] text-[#092540] font-dm-sans whitespace-nowrap">{competitor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Manual Selection View - matching Figma design */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[16px] leading-[22px] text-[#092540] font-bold font-dm-sans">
                      Select competitors manually
                    </div>
                    <button
                      className="text-[14px] leading-[20px] text-[#195afe] hover:text-[#1448cc] font-dm-sans"
                      onClick={() => {
                        // Return to suggestions: restore the first suggested list
                        setSelectedCompetitors(initialSuggestedCompetitors);
                        setIsManualSelection(false);
                      }}
                    >
                      ← Back to suggestions
                    </button>
                  </div>

                  {/* Brands label */}
                  <div className="mb-1">
                    <div className="text-[14px] leading-[20px] text-[#6b7c8c] font-dm-sans">Brands:</div>
                  </div>

                  {/* Search List Container - matching Figma design */}
                  <div className="bg-white border border-[#cbd1d7] rounded-[3px] shadow-[0px_3px_5px_0px_rgba(42,62,82,0.12)] h-[277px] relative">
                    <div className="flex flex-col h-full overflow-hidden">
                      {/* Search Input */}
                      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#e6e9ec]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm6 2-3.2-3.2" stroke="#B6BEC6" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                          className="flex-1 outline-none text-[14px] leading-[20px] placeholder-[#b6bec6] text-[#3a5166]"
                          placeholder="Search or select brands..."
                          value={competitorSearch}
                          onChange={(e) => setCompetitorSearch(e.target.value)}
                        />
                      </div>
                      
                      {/* Blue separator line */}
                      <div className="h-px bg-[#3e74fe]" />

                      {/* Checkbox List */}
                      <div className="flex-1 overflow-auto px-px">
                        {filteredCompetitors.slice(0, 20).map((competitor) => (
                          <label
                            key={competitor}
                            className="flex items-center gap-2 px-4 py-3 h-11 hover:bg-[#f7f7f8] cursor-pointer border-b border-[#e6e9ec] last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCompetitors.includes(competitor)}
                              disabled={!selectedCompetitors.includes(competitor) && selectedCompetitors.length >= 4}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedCompetitors.length < 4) {
                                    setSelectedCompetitors(prev => [...prev, competitor]);
                                  }
                                } else {
                                  setSelectedCompetitors(prev => prev.filter(c => c !== competitor));
                                }
                              }}
                              className="w-5 h-5 text-[#195afe] border-[#cbd1d7] rounded focus:ring-[#195afe]"
                            />
                            <span className={`text-[14px] leading-[20px] font-roboto ${
                              !selectedCompetitors.includes(competitor) && selectedCompetitors.length >= 4 
                                ? 'text-[#9ca3af]' 
                                : 'text-[#092540]'
                            }`}>
                              {competitor}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected count and help text */}
                  <div className="flex flex-col gap-1">
                    <div className="text-[12px] leading-[16px] text-[#6b7c8c] font-dm-sans">
                      {selectedCompetitors.length}/4 competitors selected
                    </div>
                    {selectedCompetitors.length === 0 && (
                      <div className="text-[12px] leading-[16px] text-[#9ca3af] font-dm-sans">
                        Select up to 4 competitors from the list above
                      </div>
                    )}
                    {selectedCompetitors.length >= 4 && (
                      <div className="text-[12px] leading-[16px] text-[#195afe] font-dm-sans">
                        Maximum competitors selected. Uncheck to select different ones.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Step 3 - Competitors (disabled placeholder) */
            <div className="bg-white rounded-lg p-6 mb-4 flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-[#cbd1d7] text-white text-[14px] leading-[20px] flex items-center justify-center">3</div>
              <div className="text-[20px] leading-[28px] text-[#b6bec6] font-dm-sans">Select Competitors</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e6e9ec] px-6 py-4 flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-[18px] text-[14px] leading-[20px] font-medium text-[#195afe] font-dm-sans hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={`px-4 py-2 rounded-[18px] text-[14px] leading-[20px] font-medium text-white font-dm-sans ${
              canSave ? 'bg-[#195afe] hover:bg-[#1448cc]' : 'bg-[#cbd1d7] cursor-not-allowed'
            }`}
            onClick={() => {
              if (!canSave) return;
              const derived = getDerivedTitle();
              onSave?.({ 
                title: derived, 
                category: selectedCategory, 
                brand: selectedBrand, 
                competitors: selectedCompetitors 
              });
              onClose();
            }}
            disabled={!canSave}
          >
            Save and Analyze
          </button>
        </div>
      </aside>
    </div>
  );
};

export default CreateReportDrawer;
