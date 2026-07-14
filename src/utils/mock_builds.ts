export const MOCK_BUILDS = [
  {
    id: 'apex-dominator-v4',
    title: {
      en: 'Apex Dominator V4 Extreme',
      ar: 'أبيكس دومينيتور V4 الخارقة',
      ckb: 'ئەپێکس دۆمینیتۆر V4',
    },
    price: 3499,
    image: '/builds/apex-dominator.png',
    category: 'extreme',
    isHot: true,
    specs: {
      cpu: { name: 'AMD Ryzen 9 9950X', id: '3851' }, // 👈 Added structural IDs
      gpu: { name: 'NVIDIA RTX 5090 32GB', id: '4402' },
      ram: { name: '64GB DDR5 6400MHz', id: '6a4a4c8f7bd19ff6267ed39e' },
      storage: { name: '4TB NVMe PCIe Gen 5', id: '4399' },
    },
  },
  {
    id: 'valkyrie-stream-pro',
    title: {
      en: 'Valkyrie Stream Pro',
      ar: 'فالكيري ستريم برو',
      ckb: 'ڤالکیری ستریم پرۆ',
    },
    price: 1899,
    image: '/builds/valkyrie-pro.png',
    category: 'gaming',
    isHot: false,
    specs: {
      cpu: { name: 'Intel Core i7-14700K', id: '3851' },
      gpu: { name: 'NVIDIA RTX 4070 Ti Super', id: '4402' },
      ram: { name: '32GB DDR5 6000MHz', id: '4374' },
      storage: { name: '2TB NVMe SSD', id: '4399' },
    },
  },
  {
    id: 'cyberpunk-neon-mini',
    title: {
      en: 'Cyberpunk Neon Mini-ITX',
      ar: 'سايبربانك نيون ميني',
      ckb: 'سایبەرپانک نیۆن مینی',
    },
    price: 1450,
    image: '/builds/cyberpunk-mini.png',
    category: 'compact',
    isHot: false,
    specs: {
      cpu: { name: 'AMD Ryzen 7 7800X3D', id: '3851' },
      gpu: { name: 'NVIDIA RTX 4070 Super', id: '4402' },
      ram: { name: '32GB DDR5 5600MHz', id: '4374' },
      storage: { name: '1TB NVMe SSD', id: '4399' },
    },
  },
]
