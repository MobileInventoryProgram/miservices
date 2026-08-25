/**
 * Seed script to populate Sanity with franchisee data.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-franchisees.ts
 *
 * Requires SANITY_API_TOKEN in .env (a write-access token from
 * https://www.sanity.io/manage/project/a4q9j3x1/api#tokens)
 *
 * Edit the `franchisees` array below with data from your Google Sheet
 * before running.
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

interface FranchiseeInput {
  companyName: string;
  territory: string;
  postCodes: string;
  townsCities: string;
  tags: string[];
  owners: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>;
}

// ───────────────────────────────────────────────
// Paste your franchisee data from the Google Sheet here.
// Each entry becomes one Sanity document.
// ───────────────────────────────────────────────
const franchisees: FranchiseeInput[] = [
  {
    companyName: 'Head Office',
    territory: 'Head Office',
    postCodes: 'L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11, L12, L13, L14, L15, L16, L17, L18, L19, L20, L21, L22, L23, L24, L25, L26, L27, L28, L29, L30, L31, L32, L33, L34, L35, L36, L37, L38, L39, L40, L41, L42, L43, L44, L45, L46, L47, L48, L49, L50, L51, L52, L53, L54, L55, L56, L57, L58, L59, L60, L61, L62, L63, L64, L65, L66, L67, L68, L69, L70, L71, L72, L73, L74, L75, L76, L77, L78, L79, L80, L81, L82, L83, L84, L85, L86, L87, L88, L89, L90, L91, L92, L93, L94, L95, L96, L97, L98, L99, WA1, WA2, WA3, WA4, WA5, WA7, WA8, WA9, WA10, WA11, WA12, WA13, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, M21, M23, M24, M25, M26, M27, M28, M29, M30, M31, M32, M33, M34, M35, M38, M40, M41, M43, M44, M45, M46, M50, M60, M61, M90',
    townsCities: 'Liverpool, Bootle, Crosby, Formby, Maghull, Southport, Prescot, Huyton, Kirkby, Fazakerley, Walton, Anfield, Everton, Toxteth, Dingle, Aigburth, Wavertree, Mossley Hill, Childwall, Allerton, Speke, Garston, Woolton, Halewood, Sefton Park, Edge Hill, Broadgreen, Gateacre, Norris Green, Clubmoor, Kensington, Fairfield, Old Swan, Walton-on-the-Hill, Sandhills, Warrington, Lymm, Appleton, Grappenhall, Stockton Heath, Walton, Great Sankey, Penketh, Birchwood, Winwick, Culcheth, Glazebury, Orford, Woolston, Bewsey, Rixton, Hale, Daresbury, Moore, Burtonwood, Higher Walton, Lower Walton, Widnes, Runcorn, Manchester, Chorlton-cum-Hardy, Fallowfield, Didsbury, Withington, Hulme, Moss Side, Rusholme, Longsight, Gorton, Levenshulme, Ardwick, Sale, Stretford, Urmston, Altrincham, Timperley, Partington, Hale, Bowdon, Broadheath, Sale Moor, Irlam, Cadishead, Eccles, Swinton, Worsley, Walkden, Little Hulton, Pendlebury, Clifton, Bolton, Farnworth, Kearsley, Westhoughton, Horwich, Deane, Hindley, Leigh, Atherton, Tyldesley, Wigan, Aspull, Standish, Golborne, Lowton, Leigh, Irlam, Salford, Manchester City Centre, MediaCityUK, Trafford Park',
    tags: [],
    owners: [
      { firstName: 'Head', lastName: 'Office', email: 'booking@mobileinventory.co.uk', phone: '0845 680 7976' },
    ],
  },
  {
    companyName: 'South Manchester',
    territory: 'South Manchester',
    postCodes: 'SK1, SK2, SK3, SK4, SK5, SK6, SK7, SK8, SK9, SK10, SK11, SK12, SK13, SK14, SK15, SK16, SK17, SK22, SK23, SK24, SK25, SK26, SK27, SK28, SK29, SK30, SK31, SK32, SK33, SK34, SK35, SK36, SK37, SK38, SK39, SK40, SK41, SK42, SK43, SK44, SK45, SK46, SK47, SK48, SK49, SK50, SK51, SK52, SK53, SK54, SK55, SK56, SK57, SK58, SK59, SK60, SK61, SK62, SK63, SK64, SK65, SK66, SK67, SK68, SK69, SK70, SK71, SK72, SK73, SK74, SK75, SK76, SK77, SK78, SK79, SK80, SK81, SK82, SK83, SK84, SK85, SK86, SK87, SK88, SK89, SK90, SK91, SK92, SK93, SK94, SK95, SK96, SK97, SK98, SK99, M18, M19, M20, M22, WA16, WA15, WA14',
    townsCities: 'Stockport, Cheadle, Cheadle Hulme, Bramhall, Hazel Grove, Heaton Moor, Heaton Mersey, Marple, Romiley, Bredbury, Woodley, Offerton, Davenport, Gatley, Adswood, Brinnington, Reddish, High Lane, Hazel Grove, Poynton, Disley, Prestbury, Macclesfield, Wilmslow, Handforth, Knutsford, Alderley Edge, Bollington, Poynton, Congleton, Hyde, Denton, Gee Cross, Stalybridge, Mossley, Glossop, Hadfield, New Mills, Marple Bridge, Levenshulme, Longsight, Gorton, Burnage, Didsbury, Withington, West Didsbury, Fletcher Moss, Wythenshawe, Northenden, Baguley, Benchill, Northern Moor, Sale, Brooklands, Sale Moor, Altrincham, Broadheath, Timperley, Partington, Carrington, Warburton, Ashton-under-Lyne, Audenshaw',
    tags: [],
    owners: [
      { firstName: 'Denise', lastName: 'Orford', email: 'denise.orford@mobileinventory.co.uk', phone: '07763 406242' },
    ],
  },
  {
    companyName: 'Lancashire',
    territory: 'Lancashire',
    postCodes: 'BB1, BB2, BB3, BB4, BB5, BB6, BB7, BB8, BB9, BB10, BB11, BB12, BB18, BB94, BB95, BB97, BB98, PR1, PR2, PR3, PR4, PR5, PR6, PR7, PR8, PR9, PR11, PR25, PR26, PR30, PR40, PR44, PR49, FY1, FY2, FY3, FY4, FY5, FY6, FY7, FY8, FY9, FY10, OL1, OL2, OL3, OL4, OL5, OL6, OL7, OL8, OL9, OL10, OL11, OL12, OL13, OL14, OL15, OL16, OL95, BL0, BL1, BL2, BL3, BL4, BL5, BL6, BL7, BL8, BL9, BL10, BL11, BL12, BL95, BL98',
    townsCities: 'Blackburn, Burnley, Accrington, Darwen, Clitheroe, Nelson, Colne, Rawtenstall, Bacup, Rossendale, Great Harwood, Padiham, Preston, Chorley, Leyland, Longridge, Penwortham, Garstang, Poulton-le-Fylde, Kirkham, Freckleton, Lytham St Annes, Blackpool, Fleetwood, Cleveleys, Thornton, Oldham, Rochdale, Middleton, Chadderton, Royton, Shaw, Milnrow, Littleborough, Heywood, Bolton, Farnworth, Horwich, Westhoughton, Bury, Radcliffe, Kearsley, Blackrod, Little Lever',
    tags: [],
    owners: [
      { firstName: 'Paul', lastName: 'Vose', email: 'paul.vose@mobileinventory.co.uk', phone: '07889 901808' },
    ],
  },
  {
    companyName: 'North Wales',
    territory: 'North Wales',
    postCodes: 'LL11, LL12, LL13, LL14, LL15, LL16, LL17, LL18, LL19, LL20, LL21, LL22, LL23, LL24, LL25, LL26, LL27, LL28, LL29, LL30, LL31, LL32, LL33, LL34, LL35, LL36, LL37, LL38, LL39, LL40, LL41, LL42, LL43, LL44, LL45, LL46, LL47, LL48, LL49, LL50, LL51, LL52, LL53, LL54, LL55, LL56, LL57, LL58, LL59, LL60, LL61, LL62, LL63, LL64, LL65, LL66, LL67, LL68, LL69, LL70, LL71, LL72, LL73, LL74, LL75, LL76, LL77, LL78, LL79, LL80, LL81, LL82, LL83, LL84, LL85, LL86, LL87, LL88, LL89, LL90, LL91, LL92, LL93, LL94, LL95, LL96, LL97, LL98, LL99, CH5, CH6, CH7, CH8',
    townsCities: 'Wrexham, Coedpoeth, Brymbo, Minera, Rossett, Gresford, Caergwrle, Overton, Bangor-on-Dee, Rhosllanerchrugog, Chirk, Ruabon, Cefn Mawr, Ruthin, Denbigh, St Asaph, Rhyl, Prestatyn, Llangollen, Corwen, Abergele, Bala, Betws-y-Coed, Llanrwst, Colwyn Bay, Rhos-on-Sea, Llandudno, Penrhyn Bay, Llandudno Junction, Conwy, Llanfairfechan, Penmaenmawr, Aberdovey, Tywyn, Blaenau Ffestiniog, Barmouth, Harlech, Porthmadog, Criccieth, Pwllheli, Caernarfon, Y Felinheli, Bangor, Bethesda, Beaumaris, Menai Bridge, Holyhead, Gaerwen, Llanfairpwllgwyngyll, Brynsiencyn, Bodorgan, Ty Croes, Rhosneigr, Llangefni, Amlwch, Cemaes Bay, Dulas, Llannerch-y-Medd, Moelfre, Benllech, Pentraeth, Llanbedrgoch, Brynteg, Connah\'s Quay, Hawarden, Flint, Mold, Holywell',
    tags: [],
    owners: [
      { firstName: 'Jeff', lastName: 'Henshaw', email: 'jeff.henshaw@mobileinventory.co.uk', phone: '07739 986031' },
    ],
  },
  {
    companyName: 'South Wales',
    territory: 'South Wales',
    postCodes: 'CF3, CF5, CF10, CF11, CF14, CF15, CF23, CF24, CF31, CF32, CF33, CF34, CF35, CF36, CF37, CF38, CF39, CF40, CF41, CF42, CF43, CF44, CF45, CF46, CF47, CF48, CF61, CF62, CF63, CF64, CF81, CF82, CF83, CF91, CF95, CF99, SA1, SA2, SA3, SA4, SA5, SA6, SA7, SA8, SA9, SA10, SA11, SA12, SA13, SA14, SA15, SA16, SA17, SA18, SA19, SA20, SA31, SA32, SA33, SA34, SA35, SA36, SA37, SA38, SA39, SA44, SA48, SA61, SA62, SA63, SA64, SA65, SA66, SA67, SA68, SA69, SA70, SA71, SA72, SA73, SA99, NP4, NP7, NP8, NP10, NP11, NP12, NP13, NP15, NP16, NP18, NP19, NP20, NP22, NP23, NP24, NP25, NP26, NP44',
    townsCities: 'Cardiff, Bridgend, Merthyr Tydfil, Caerphilly, Aberdare, Bargoed, Barry, Cowbridge, Dinas Powys, Ferndale, Hengoed, Llantwit Major, Maesteg, Mountain Ash, Penarth, Pontypridd, Porth, Porthcawl, Tonypandy, Treharris, Treorchy, Swansea, Neath, Carmarthen, Ammanford, Llanelli, Port Talbot, Aberaeron, Burry Port, Cardigan, Haverfordwest, Tenby, Kidwelly, Fishguard, Pembroke, Pembroke Dock, Newport, Pontypool, Blaenavon, Abergavenny, Monmouth, Chepstow, Abertillery, Usk, Tredegar, Ebbw Vale, New Tredegar, Blackwood, Caldicot, Cwmbran',
    tags: [],
    owners: [
      { firstName: 'Paul', lastName: 'Bowen', email: 'paul.bowen@mobileinventory.co.uk', phone: '07538 835999' },
    ],
  },
  {
    companyName: 'West Yorkshire',
    territory: 'West Yorkshire',
    postCodes: 'LS1, LS2, LS3, LS4, LS5, LS6, LS7, LS8, LS9, LS10, LS11, LS12, LS13, LS14, LS15, LS16, LS17, LS18, LS19, LS20, LS21, LS22, LS23, LS24, LS25, LS26, LS27, LS28, LS29, LS30, LS31, LS32, LS33, LS34, LS35, LS36, LS37, LS38, LS39, LS40, LS41, LS42, LS43, LS44, LS45, LS46, LS47, LS48, LS49, LS98, LS99, HX1, HX2, HX3, HX4, HX5, HX6, HX7, HD1, HD2, HD3, HD4, HD5, HD6, HD7, HD8, HD9, HD10, HD11, HD12, HD13, HD14, HD15, HD16, HD17, WF1, WF2, WF3, WF4, WF5, WF6, WF7, WF8, WF9, WF10, WF11, WF12, WF13, WF14, WF15, WF16, WF17, WF18, WF19, WF20, WF21, WF22, WF23, WF24, WF25, WF26, WF27, WF28, WF29, WF30',
    townsCities: 'Leeds, Headingley, Chapel Allerton, Roundhay, Harehills, Armley, Morley, Garforth, Otley, Wetherby, Pudsey, Rothwell, Horsforth, Bramley, Meanwood, Seacroft, Thorner, Boston Spa, Collingham, Scholes, Tadcaster, Halifax, Ovenden, Illingworth, Mixenden, Northowram, Shelf, Sowerby Bridge, Mytholmroyd, Ripponden, Barkisland, Huddersfield, Kirkburton, Holmfirth, Meltham, Slaithwaite, Milnsbridge, Linthwaite, Lockwood, Denby Dale, Marsden, Birkby, Wakefield, Castleford, Pontefract, Featherstone, Hemsworth, Normanton, Ossett, Horbury, South Elmsall, South Kirkby, Outwood, Knottingley, Stanley, Crofton, Walton, Lofthouse, Ackworth, Crigglestone',
    tags: [],
    owners: [
      { firstName: 'David', lastName: 'Swain', email: 'david.swain@mobileinventory.co.uk', phone: '07801902479' },
      { firstName: 'Ian', lastName: 'Swain', email: 'ian.swain@mobileinventory.co.uk', phone: '07713490643' },
    ],
  },
  {
    companyName: 'Peterborough',
    territory: 'Peterborough',
    postCodes: 'PE1, PE2, PE3, PE4, PE5, PE6, PE7, PE8, PE9, PE10, PE15, PE16, PE19, PE26, PE27, PE28, PE29, LE15',
    townsCities: 'Peterborough, Bourne, Market Deeping, Stamford, Spalding, Oakham, Whittlesey, March, Yaxley, Ramsey, Huntingdon, Godmanchester, St Ives, St Neots, Eaton Socon',
    tags: [],
    owners: [
      { firstName: 'Martyn', lastName: 'Boyle', email: 'martyn@mobileinventory.co.uk', phone: '07910 664391' },
    ],
  },
  {
    companyName: 'Bath and Swindon',
    territory: 'Bath and Swindon',
    postCodes: 'BA, SN',
    townsCities: '',
    tags: [],
    owners: [
      { firstName: 'Pete', lastName: 'Nicholls', email: 'pete.nicholls@mobileinventory.co.uk', phone: '07771 908556' },
    ],
  },
  {
    companyName: 'Worcester and West Midlands',
    territory: 'Worcester and West Midlands',
    postCodes: 'DY1, DY2, DY3, DY4, DY5, DY6, DY7, DY8, DY9, DY10, DY11, DY12, DY13, DY14, WR1, WR2, WR3, WR4, WR5, WR6, WR7, WR8, WR9, WR10, WR11, WR12, WR13, WR14, WR15, WV1, WV2, WV3, WV4, WV5, WV6, WV7, WV8, WV9, WV10, WV11, WV12, WV13, WV14, WV15, WV16, TF1, TF2, TF3, TF4, TF5, TF6, TF7, TF8, TF9, TF10, TF11, TF12, TF13',
    townsCities: 'Bilston, Brierley Hill, Bridgnorth, Broadway, Droitwich, Dudley, Evesham, Kidderminster, Kingswinford, Malvern, Perton, Sedgley, Stourbridge, Stourport-on-Severn, Tenbury Wells, Tettenhall, Willenhall, Wolverhampton, Worcester, Telford, Newport, Market Drayton, Shifnal, Much Wenlock, Broseley, Ironbridge, Wellington, Dawley, Oakengates, Madeley, Bridgnorth',
    tags: [],
    owners: [
      { firstName: 'Harmeet', lastName: 'Channa', email: 'harmeet.channa@mobileinventory.co.uk', phone: '07586 320505' },
    ],
  },
  {
    companyName: 'Coventry',
    territory: 'Coventry',
    postCodes: 'CV1, CV2, CV3, CV4, CV5, CV6, CV7, CV8, CV9, CV10, CV11, CV12, CV13, CV21, CV22, CV23, CV31, CV32, CV33, CV34, CV35, CV36, CV37, CV47, LE1, LE2, LE3, LE4, LE5, LE6, LE7, LE8, LE9, LE10, LE11, LE12, LE13, LE14, LE16, LE17, LE18, LE19, LE65, LE67, B25, B26, B27, B28, B40, B46, B47, B48, B49, B50, B60, B61, B77, B78, B79, B80, B90, B91, B92, B93, B94, B95, B96, B97, B98',
    townsCities: 'Coventry, Rugby, Warwick, Kenilworth, Leamington Spa, Southam, Nuneaton, Bedworth, Atherstone, Stratford-Upon-Avon, Henley-in-Arden, Alcester, Studley, Wellesbourne, Ryton-on-Dunsmore, Wolston, Leek Wootton, Polesworth, Kingsbury, Shipston on Stour, Coleshill, Tanworth-in-Arden, Lapworth, Burton Green, Hinckley, Market Harborough, Market Bosworth, Leicester, Lutterworth, Loughborough, Markfield, Castle Donington, Ashby-de-la-Zouch, Melton Mowbray, Measham, Earl Shilton, Enderby, Oadby, Blaby, Coalville, Wigston, Kibworth Harcourt, Groby, Braunston, Glenfield, Broughton Astley, Mountsorrel, Kegworth, Solihull, Shirley, Hall Green, Acocks Green, Bromsgrove, Redditch, Alvechurch, Balsall Common, Hockley Heath, Knowle, Dorridge, Sheldon, Yardley, Tamworth',
    tags: [],
    owners: [
      { firstName: 'Simon', lastName: 'Edwards', email: 'simon.edwards@mobileinventory.co.uk', phone: '0790 540 4708' },
      { firstName: 'Alex', lastName: 'Edwards', email: 'alex.edwards@mobileinventory.co.uk', phone: '07565 828 386' },
    ],
  },
  {
    companyName: 'Birmingham',
    territory: 'Birmingham',
    postCodes: 'WS1, WS2, WS3, WS4, WS5, WS6, WS7, WS8, WS9, WS10, WS11, WS12, WS13, WS14, WS15, B1, B2, B3, B4, B5, B15, B16, B17, B18, B19, B20, B21, B23, B24, B29, B30, B31, B32, B33, B34, B35, B36, B37, B38, B42, B43, B44, B45, B62, B63, B64, B65, B66, B67, B68, B69, B70, B71, B72, B73, B74, B75, B76',
    townsCities: 'Aston, Balsall Heath, Birmingham, Bordesley, Bordesley Green, Bournbrook, Bournville, Castle Vale, Edgbaston, Erdington, Four Oaks, Great Barr, Handsworth, Harborne, Hockley, Kings Heath, Kings Norton, Kingstanding, Kitts Green, Ladywood, Lozells, Minworth, Moseley, Nechells, New Oscott, Northfield, Perry Barr, Quinton, Saltley, Selly Oak, Selly Park, Shard End, Sheldon, Small Heath, Sparkbrook, Sparkhill, Stechford, Stirchley, Stockland Green, Sutton Coldfield, Tyseley, Vauxhall, Ward End, Washwood Heath, Weoley Castle, Winson Green, Witton, Woodgate, Wylde Green, Yardley, Yardley Wood',
    tags: [],
    owners: [
      { firstName: 'Paul', lastName: 'Palmer', email: 'paul.palmer@mobileinventory.co.uk', phone: '07502 842 219' },
    ],
  },
  {
    companyName: 'Herts',
    territory: 'Herts',
    postCodes: 'SG1, SG2, SG3, SG4, SG5, SG6, SG7, SG8, SG9, SG10, SG11, SG12, SG13, SG14, SG15, SG16, SG17, SG18, SG19, SG99, LU1, LU2, LU3, LU4, LU5, LU6, LU7, LU8, LU9, LU10, LU11, LU12, AL1, AL2, AL3, AL4, AL5, AL6, AL7, AL8, AL9, WD3, WD4, WD5, WD6, WD7, WD17, WD18, WD19, WD23, MK1, MK2, MK3, MK4, MK5, MK6, MK7, MK8, MK9, MK10, MK11, MK12, MK13, MK14, MK15, MK16, MK17, MK18, MK19, MK40, MK41, MK42, MK43, MK44, MK45, MK46, MK77, MK90, MK92, HP1, HP2, HP3, HP4, HP5, HP6, HP7, HP8, HP9, HP10, HP11, HP12, HP13, HP14, HP15, HP16, HP17, HP18, HP19, HP20, HP21, HP22, HP23, HP27',
    townsCities: 'Stevenage, Hitchin, Letchworth Garden City, Baldock, Royston, Ware, Hertford, Biggleswade, Sandy, Buntingford, Shefford, Luton, Dunstable, Houghton Regis, Leighton Buzzard, St Albans, Harpenden, Welwyn, Welwyn Garden City, Hatfield, Watford, Rickmansworth, Borehamwood, Abbots Langley, Kings Langley, Bushey, Radlett, Milton Keynes, Buckingham, Newport Pagnell, Hemel Hempstead, Berkhamsted, Chesham, Amersham, Little Chalfont, Chalfont St Giles, Beaconsfield, High Wycombe, Hazlemere, Widmer End, Great Missenden, Aylesbury, Wendover, Tring, Princes Risborough',
    tags: [],
    owners: [
      { firstName: 'Shane', lastName: 'Osman', email: 'shane.osman@mobileinventory.co.uk', phone: '07960 955844' },
    ],
  },
  {
    companyName: 'London South East',
    territory: 'London South East',
    postCodes: 'SE24, SE22, SE21, SE23, SE27, SE19, SE26, SE20, SE25',
    townsCities: 'Crystal Palace, Upper Norwood, Anerley, Penge, Dulwich, Dulwich Village, West Dulwich, Tulse Hill, East Dulwich, Peckham Rye, Forest Hill, Honor Oak, Crofton Park, Perry Vale, Herne Hill, West Norwood, Gipsy Hill, South Norwood, Selhurst, Thornton Heath, Woodside, Sydenham',
    tags: [],
    owners: [
      { firstName: 'Sebastian', lastName: 'Mouzo', email: 'sebastian.mouzo@mobileinventory.co.uk', phone: '78272 93955' },
    ],
  },
  {
    companyName: 'London Central',
    territory: 'London Central',
    postCodes: 'WC1, WC2, NW1, NW5, NW8',
    townsCities: 'Bloomsbury, Holborn, Covent Garden, Leicester Square, Charing Cross, Camden Town, Regent\'s Park, Baker Street, Euston, Primrose Hill, Kentish Town, St John\'s Wood, Marylebone',
    tags: [],
    owners: [
      { firstName: 'James', lastName: 'Cahill', email: 'james.cahill@mobileinventory.co.uk', phone: '07972 924777' },
    ],
  },
  {
    companyName: 'Dorset',
    territory: 'Dorset',
    postCodes: 'BH1, BH2, BH3, BH4, BH5, BH6, BH7, BH8, BH9, BH10, BH11, BH12, BH13, BH14, BH15, BH16, BH17, BH18, BH19, BH20, BH21, BH22, BH23, BH24, BH25, BH31',
    townsCities: 'Bournemouth, Christchurch, Wimborne, Poole, Southampton, Salisbury, Portsmouth, Weymouth, Dorchester, Corfe Castle, Bere Regis, Blandford Forum, Gillingham, Sturminster Newton, Shaftesbury, Verwood, New Forest, Fordingbridge, Burley, New Milton, Lymington, West Moors, Three Legged Cross, Brockenhurst, Eastleigh, Fareham, Winchester, Swanage',
    tags: [],
    owners: [
      { firstName: 'Adnan', lastName: 'Sharif', email: 'adnan.sharif@mobileinventory.co.uk', phone: '07528 128111' },
    ],
  },
  {
    companyName: 'Reading',
    territory: 'Reading',
    postCodes: 'OX1, OX2, OX3, OX4, OX5, OX7, OX9, OX10, OX11, OX12, OX13, OX14, OX15, OX16, OX17, OX18, OX20, OX25, OX26, OX27, OX28, OX29, OX33, OX39, OX44, OX49, RG1, RG2, RG4, RG5, RG6, RG30, RG31',
    townsCities: 'Oxford, Abingdon, Banbury, Bicester, Carterton, Didcot, Thame, Wallingford, Wantage, Watlington, Witney, Woodstock, Kidlington, Headington, Cowley, Wheatley, Reading, Tilehurst, Caversham, Woodley, Earley, Sonning, Pangbourne, Wokingham, Henley, Goring, Streatley, Basingstoke, Hook, Bracknell, Binfield, Crowthorne',
    tags: [],
    owners: [
      { firstName: 'Sally', lastName: 'Jones', email: 'sally.jones@mobileinventory.co.uk', phone: '07921 778732' },
    ],
  },
  {
    companyName: 'Bristol',
    territory: 'Bristol',
    postCodes: 'BS1, BS2, BS3, BS4, BS5, BS6, BS7, BS8, BS9, BS10, BS11, BS13, BS14, BS15, BS16, BS20, BS21, BS22, BS23, BS24, BS25, BS26, BS27, BS28, BS29, BS30, BS31, BS32, BS34, BS35, BS36, BS37, BS39, BS40, BS41, BS48, BS49',
    townsCities: 'Bristol, Portishead, Clevedon, Weston-super-Mare, Worle, Uphill, Hutton, Locking, Banwell, Winscombe, Axbridge, Cheddar, Wedmore, Brent Knoll, Burnham-on-Sea, Highbridge, Longwell Green, Keynsham, Saltford, Kingswood, Downend, Emersons Green, Bradley Stoke, Filton, Patchway, Almondsbury, Thornbury, Yate, Chipping Sodbury, Radstock, Temple Cloud, Paulton, Midsomer Norton, Clutton, Winford, Long Ashton, Backwell, Nailsea, Yatton',
    tags: [],
    owners: [
      { firstName: 'Dom', lastName: 'Boopher', email: 'dom.boopher@mobileinventory.co.uk', phone: '07841 426048' },
      { firstName: 'Kim', lastName: 'Boopher', email: '', phone: '' },
    ],
  },
  {
    companyName: 'Sheffield',
    territory: 'Sheffield',
    postCodes: 'S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S17, S18, S20, S21, S25, S26, S32, S33, S35, S36, S40, S41, S42, S43, S44, S45, S49, S60, S61, S62, S63, S64, S65, S66, S70, S71, S72, S73, S74, S75, S80, S81, S95, S96, S97, S98, S99, DN1, DN2, DN3, DN4, DN5, DN6, DN7, DN11, DN12',
    townsCities: 'Sheffield, Doncaster, Chesterfield, Barlborough, Clowne, Worksop, Wales, Dronfield, Bolsover, Rotherham, Barnsley, Warsop, Shirebrook, Mosborough, Crystal Peaks, Swallownest, Kiveton Park, Dinnington, North Anston, South Anston, Killamarsh, Maltby, Bramley, Wickersley, Eckington, Birdwell, Worsbrough, Hoyland, Wombwell, Brampton, Wath upon Dearne, Bolton upon Dearne, Swinton, Mexborough',
    tags: [],
    owners: [
      { firstName: 'Neale', lastName: 'Roberts', email: 'neale.roberts@mobileinventory.co.uk', phone: '07914 596525' },
    ],
  },
  {
    companyName: 'Glasgow Central',
    territory: 'Glasgow Central',
    postCodes: 'G1, G2, G3, G4, G5, G9, G11, G12, G13, G14, G15, G20, G21, G22, G23, G31, G32, G33, G34, G40, G41, G42, G43, G44, G45, G46, G51, G52, G53, G58, G60, G61, G62, G63, G64, G65, G66, G67, G68, G69, G70, G71, G72, G73, G74, G75, G76, G77, G78, G79, G90, FK1, FK2, FK3, FK4, FK5, FK6, FK7, FK8, FK9, FK10, FK11, FK12, FK13, FK14, FK15, FK16, FK17, FK18, FK19, FK20, FK21',
    townsCities: 'Glasgow, Stirling, Falkirk, Kirkintilloch, Lenzie, Kilsyth, Bishopbriggs, Milngavie, Bearsden, Clydebank, Cumbernauld, East Kilbride, Rutherglen, Cambuslang, Newton Mearns, Giffnock, Clarkston, Alloa, Dunblane, Dollar, Callander, Aberfoyle, Drymen, Strathblane, Helensburgh, Dumbarton, Larbert, Grangemouth, Denny',
    tags: [],
    owners: [
      { firstName: 'Graham', lastName: 'Cuthbert', email: 'graham.cuthbert@mobileinventory.co.uk', phone: '07368 824388' },
    ],
  },
  {
    companyName: 'Dundee',
    territory: 'Dundee',
    postCodes: 'DD1, DD2, DD3, DD4, DD5, DD6, DD7, DD8, DD9, DD10, DD11, PH1, PH2, PH3, PH4, PH5, PH6, PH7, PH8, PH9, PH10, PH11, PH12, PH13, PH14, PH15, PH16, PH17, PH18, PH19, PH20, PH21, PH22, PH23, PH24, PH25, PH26, PH30, PH31, PH32, PH33, PH34, PH35, PH36, PH37, PH38, PH39, PH40, PH41, PH42, PH43, PH44, PH49, PH50',
    townsCities: 'Dundee, Broughty Ferry, Monifieth, Newport-on-Tay, Tayport, Carnoustie, Forfar, Brechin, Montrose, Arbroath, Perth, Auchterarder, Crieff, Comrie, Dunkeld, Pitlochry, Blairgowrie, Rattray, Alyth, Meigle, Coupar Angus, Aberfeldy, Newtonmore, Kingussie, Aviemore, Carrbridge, Nethy Bridge, Grantown-on-Spey, Fort William, Roybridge, Fort Augustus, Invergarry, Acharacle, Glenfinnan, Lochailort, Arisaig, Mallaig, Isle of Eigg, Isle of Rum, Isle of Canna, Ballachulish, Kinlochleven',
    tags: [],
    owners: [
      { firstName: 'Anthony', lastName: 'Stuart', email: 'anthony.stuart@mobileinventory.co.uk', phone: '07882861280' },
    ],
  },
  {
    companyName: 'Kingston',
    territory: 'Kingston',
    postCodes: 'KT1, KT2, KT3, KT4, KT5, KT6, KT7, KT8, KT9, KT10, KT11, KT12, KT13, KT14, KT15, KT16, KT17, KT18, KT19, KT20, KT21, KT22, KT23, KT24',
    townsCities: 'Kingston upon Thames, Norbiton, Surbiton, Tolworth, Long Ditton, New Malden, Worcester Park, Stoneleigh, Chessington, Epsom, Ewell, Leatherhead, Ashtead, Banstead, Reigate, Redhill, Dorking, Fetcham, Cobham, Walton-on-Thames, Weybridge, Esher, Hersham, Molesey, East Molesey, Woking',
    tags: [],
    owners: [
      { firstName: 'Lynn', lastName: 'Howard', email: 'lynn.howard@mobileinventory.co.uk', phone: '07818 218477' },
    ],
  },
  {
    companyName: 'Enfield',
    territory: 'Enfield',
    postCodes: 'EN1, EN2, EN3, EN4, EN5, EN6, EN7, EN8, EN9, EN10, EN11, N9, N14, N21',
    townsCities: 'Enfield Town, Bush Hill Park, Lower Edmonton, Enfield Chase, Enfield Highway, Enfield Lock, Brimsdown, Ponders End, Cockfosters, East Barnet, Hadley Wood, New Barnet, High Barnet, Arkley, Potters Bar, South Mimms, Cuffley, Northaw, Cheshunt, Goffs Oak, Capel Manor, Waltham Cross, Bullsmoor, Waltham Abbey, Nazeing, Upshire, Broxbourne, Wormley, Turnford, Hoddesdon, Dobbs Weir, Southgate, Palmers Green, Winchmore Hill, Grange Park, Friern Barnet, New Southgate, Arnos Grove, Totteridge, Woodside Park',
    tags: [],
    owners: [
      { firstName: 'Dennis', lastName: 'Haldini', email: 'dennis.haldini@mobileinventory.co.uk', phone: '07502490343' },
    ],
  },
  {
    companyName: 'London South East (North)',
    territory: 'London South East (North)',
    postCodes: 'E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12, E13, E14, E15, E16, E17, E18, E20, E21, E22, E23, E24, SW1, SW11, SW8, SW9, SW4, SW2, SW12, SW17, SW16, SE18, SE19, SE20, SE21, SE22, SE23, SE24, SE25, SE26, SE27, SE28',
    townsCities: 'Whitechapel, Aldgate, Stepney, Spitalfields, Bethnal Green, Haggerston, Bow, Bromley-by-Bow, East India Dock, Chingford, Highams Park, Clapton, Upper Clapton, Hackney, East Ham, Beckton, Upton Park, Forest Gate, Stratford, West Ham, Dalston, London Fields, Homerton, Hackney Wick, Victoria Park, Leyton, Leytonstone, Wanstead, Manor Park, Plaistow, Canary Wharf, Poplar, Isle of Dogs, Walthamstow, South Woodford, Woodford Green, Olympic Park, Westminster, Belgravia, Pimlico, Victoria, Battersea, Clapham Junction, Vauxhall, Nine Elms, South Lambeth, Brixton, Stockwell, Clapham, Clapham Common, Streatham Hill, Clapham Park, Balham, Streatham, Norbury, Tooting, Tooting Bec, Woolwich, Plumstead, Crystal Palace, Upper Norwood, Anerley, Penge, Dulwich, East Dulwich, Forest Hill, Herne Hill, South Norwood, Selhurst, Sydenham, West Norwood, Thamesmead, Abbey Wood',
    tags: [],
    owners: [
      { firstName: 'Lindsay', lastName: 'Dixon', email: 'lindsay.dixon@mobileinventory.co.uk', phone: '07889783877' },
    ],
  },
  {
    companyName: 'Twickenham',
    territory: 'Twickenham',
    postCodes: 'TW1, TW2, TW3, TW4, TW5, TW6, TW7, TW8, TW9, TW10, TW11, TW12, TW13, TW14, TW15, TW16, TW17, TW18, TW19, TW20, TW21, TW22, TW23, TW24',
    townsCities: 'Twickenham, Teddington, Hampton, Hampton Hill, Hampton Wick, Whitton, Isleworth, Hounslow, Chiswick, Brentford, Richmond, Kew, Mortlake, Barnes, Hammersmith, Feltham, Ashford, Sunbury-on-Thames, Shepperton, Staines-upon-Thames, Egham, Egham Hythe, Walton-on-Thames, Weybridge, Byfleet, Chertsey, Addlestone, Long Ditton, Surbiton, Kingston upon Thames, New Malden, Chessington, Tolworth, Leatherhead, Esher, Cobham, Claygate, Molesey, East Molesey, West Molesey',
    tags: [],
    owners: [
      { firstName: 'Richard', lastName: 'Fellows', email: 'richard.fellows@mobileinventory.co.uk', phone: '07702190067' },
    ],
  },
  {
    companyName: 'Essex',
    territory: 'Essex',
    postCodes: 'RM1, RM2, RM3, RM4, RM5, RM6, RM7, RM8, RM9, RM10, RM11, RM12, RM13, RM14, RM15, RM16, RM17, RM18, RM19, RM20, RM21, RM22, RM23, RM24, RM25, RM26, SS0, SS1, SS2, SS3, SS4, SS5, SS6, SS7, SS8, SS9, SS10, SS11, SS12, SS13, SS14, SS15, SS16, SS17, SS18, SS99',
    townsCities: 'Romford, Hornchurch, Upminster, Rainham, Dagenham, Beam Park, Elm Park, Harold Wood, South Hornchurch, Wennington, Cranham, Noak Hill, Havering-atte-Bower, Hornchurch Marshes, Ardleigh Green, Collier Row, Gidea Park, Harold Hill, Romford Market, South Ockendon, Purfleet, West Thurrock, Rainham Marshes, North Ockendon, Aveley, Chafford Hundred, Grays, Ockendon, Southend-on-Sea, Westcliff-on-Sea, Leigh-on-Sea, Shoeburyness, Benfleet, Hadleigh, Rayleigh, Rochford, Rawreth, Canvey Island, Stanford-le-Hope, Corringham, Horndon-on-the-Hill, Tilbury, Chadwell St Mary, Little Thurrock, Orsett',
    tags: [],
    owners: [
      { firstName: 'Michael', lastName: 'Newman', email: 'michael.newman@mobileinventory.co.uk', phone: '0776 838 4710' },
    ],
  },
  {
    companyName: 'East Kent',
    territory: 'East Kent',
    postCodes: 'CT1, CT2, CT3, CT4, CT12, CT13, CT14, CT15, CT16, CT17, CT18, CT19, CT20, CT21, TN23, TN24, TN25, TN26, TN27, TN28, TN29',
    townsCities: 'Canterbury, Sturry, Blean, Herne Bay, Whitstable, Chislet, Westgate-on-Sea, Minster, Birchington, Margate, Broadstairs, Ramsgate, Monkton, Sandwich, Deal, Walmer, Dover, River, Eastry, Sandwich Bay, Dovercourt, Folkestone, Hythe, New Romney, Lydd, Dymchurch, Ashford, Tenterden, Rolvenden, Wittersham, Cranbrook, Hawkhurst, Goudhurst, Sissinghurst, Benenden, Northiam, Rye, Winchelsea, Appledore, Tenterden Heath, St. Michaels, Wadhurst, Robertsbridge, Flimwell, Lamberhurst, Burwash, Bodiam',
    tags: [],
    owners: [
      { firstName: 'Gordon', lastName: 'Archer', email: 'gordon@mobileinventory.co.uk', phone: '07841426051' },
    ],
  },
  {
    companyName: 'West Cheshire and Wirral',
    territory: 'West Cheshire and Wirral',
    postCodes: 'CH1, CH2, CH3, CH4, CH25, CH26, CH27, CH28, CH29, CH30, CH31, CH32, CH33, CH34, CH41, CH42, CH43, CH44, CH45, CH46, CH47, CH48, CH49, CH60, CH61, CH62, CH63, CH64, CH65, CH66, CH70, CH88, CH99, WA6',
    townsCities: 'Chester, Blacon, Handbridge, Curzon Park, Vicars Cross, Hoole, Upton-by-Chester, Backford, Sealand, Mickle Trafford, Tarvin, Waverton, Saighton, Farndon, Saltney, Broughton, Pulford, Penyffordd, Connah\'s Quay, Shotton, Queensferry, Garden City, Hawarden, Ewloe, Birkenhead, Claughton, Seacombe, Tranmere, Woodside, Prenton, Beechwood, Bidston, Oxton, Wallasey, Liscard, Egremont, New Brighton, Wallasey Village, Leasowe, Moreton, Saughall Massie, Hoylake, Meols, Caldy, Grange, West Kirby, Woodchurch, Greasby, Landican, Upton, Heswall, Gayton, Irby, Thingwall, Thurstaston, Barnston, Neston, Parkgate, Willaston, Little Neston, Burton, Ness, Ellesmere Port, Whitby, Great Sutton, Hooton, Childer Thornton, Ledsham, Overpool, Frodsham, Norley, Helsby, Manley, Alvanley',
    tags: [],
    owners: [
      { firstName: 'Aaron', lastName: 'Keen', email: 'aaron.keen@mobileinventory.co.uk', phone: '07405 405 577' },
    ],
  },
  {
    companyName: 'Brighton',
    territory: 'Brighton',
    postCodes: 'BN1, BN2, BN3, BN4, BN5, BN6, BN7, BN8, BN9, BN10, BN11, BN12, BN13, BN14, BN15, BN16, BN17, BN18, BN20, BN21, BN22, BN23, BN24, BN25, BN26, BN27, BN41, BN42, BN43, BN44, BN45, BN50, BN51, BN52, BN88, BN91, BN99',
    townsCities: 'Brighton, Hove, Shoreham-by-Sea, Southwick, Portslade, Lancing, Worthing, Littlehampton, Arundel, Bognor Regis, Chichester, Selsey, East Wittering, West Wittering, Midhurst, Petworth, Pulborough, Steyning, Henfield, Hassocks, Burgess Hill, Haywards Heath, Cuckfield, Lindfield, Ditchling, Lewes, Newhaven, Seaford, Peacehaven, Saltdean, Rottingdean, Polegate, Eastbourne, Hailsham, Pevensey, Alfriston, Uckfield, Crowborough',
    tags: [],
    owners: [
      { firstName: 'Isaac', lastName: 'Nwabueze', email: 'isaac.makua@mobileinventory.co.uk', phone: '07307976263' },
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  if (franchisees.length === 0) {
    console.log('No franchisees to seed. Edit the franchisees array in this file first.');
    process.exit(0);
  }

  console.log(`Seeding ${franchisees.length} franchisee(s) into Sanity...`);

  const transaction = client.transaction();

  for (const f of franchisees) {
    const slug = slugify(f.companyName);

    const doc = {
      _type: 'franchisee' as const,
      companyName: f.companyName,
      slug: { _type: 'slug' as const, current: slug },
      territory: f.territory,
      postCodes: f.postCodes,
      townsCities: f.townsCities,
      tags: f.tags,
      isActive: true,
      owners: f.owners.map((owner) => ({
        _type: 'object' as const,
        _key: slugify(`${owner.firstName}-${owner.lastName}`),
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phone: owner.phone,
      })),
    };

    transaction.create(doc);
    console.log(`  + ${f.companyName} (${slug})`);
  }

  const result = await transaction.commit();
  console.log(`\nDone! Created ${result.documentIds.length} document(s).`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
