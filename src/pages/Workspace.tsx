import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Maximize2, 
  Layout, 
  ChevronDown,
  Undo2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Minus,
  RotateCw,
  ArrowLeftRight,
  ArrowUpDown,
  Edit2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { getCustomAssets, publishTemplate, getCurrentUser } from '../services/db';

interface DesignElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  shapeType?: 'rect' | 'circle' | 'triangle';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  imageUrl?: string;
  lineStyle?: 'solid' | 'dashed';
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  textStrokeColor?: string;
  textStrokeWidth?: number;
  fillType?: 'color' | 'gradient';
  fillGradient?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  filterBlur?: number;
  shadowBlur?: number;
  shadowColor?: string;
}

const PRESETS = [
  { name: 'Instagram Post (1:1)', width: 800, height: 800 },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920 },
  { name: 'YouTube Landscape (16:9)', width: 1920, height: 1080 },
  { name: 'Dokumen A4', width: 1240, height: 1754 },
];

const FONTS = [
  { name: 'Poppins', class: 'font-poppins' },
  { name: 'Inter', class: 'font-inter' },
  { name: 'Montserrat', class: 'font-montserrat' },
  { name: 'Playfair Display', class: 'font-playfair' },
  { name: 'Bebas Neue', class: 'font-bebas' },
  { name: 'Lobster', class: 'font-lobster' },
  { name: 'Lora', class: 'font-lora' },
  { name: 'Space Mono', class: 'font-mono' },
];

const GRADIENTS = [
  { name: 'Slate Dark', value: 'linear-gradient(135deg, #0f172a, #1e293b)' },
  { name: 'Neon Purple', value: 'linear-gradient(135deg, #1e053a, #0c011e)' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f43f5e, #fbbf24)' },
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #090514, #120c1f)' },
];

const getGradientStops = (gradientVal: string) => {
  if (!gradientVal) return { stop1: '#0f172a', stop2: '#1e293b' };
  const hexMatches = gradientVal.match(/#[0-9a-fA-F]{3,8}/g);
  if (hexMatches && hexMatches.length >= 2) {
    return { stop1: hexMatches[0], stop2: hexMatches[1] };
  }
  if (gradientVal === GRADIENTS[0].value) return { stop1: '#0f172a', stop2: '#1e293b' };
  if (gradientVal === GRADIENTS[1].value) return { stop1: '#1e053a', stop2: '#0c011e' };
  if (gradientVal === GRADIENTS[2].value) return { stop1: '#f43f5e', stop2: '#fbbf24' };
  if (gradientVal === GRADIENTS[3].value) return { stop1: '#06b6d4', stop2: '#3b82f6' };
  return { stop1: '#090514', stop2: '#120c1f' };
};

const assetModules = import.meta.glob('/src/assets/gallery/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });

const getScannedAssets = () => {
  const assets: { [category: string]: { name: string; url: string }[] } = {};
  
  for (const path in assetModules) {
    const parts = path.split('/');
    const galleryIndex = parts.indexOf('gallery');
    if (galleryIndex > -1 && galleryIndex < parts.length - 1) {
      const category = parts[galleryIndex + 1];
      const fileNameWithExt = parts[parts.length - 1];
      const name = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')) || fileNameWithExt;
      
      const module = assetModules[path] as any;
      const url = module.default || module;
      
      if (!assets[category]) {
        assets[category] = [];
      }
      assets[category].push({ name, url });
    }
  }
  return assets;
};

export const Workspace = () => {
  const navigate = useNavigate();
  const scannedAssets = getScannedAssets();
  const [customAssets, setCustomAssets] = useState<{ name: string; url: string; category: string }[]>([]);
  
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await getCustomAssets();
        setCustomAssets(assets);
      } catch (err) {
        console.error('Failed to load custom assets:', err);
      }
    };
    fetchAssets();
  }, []);

  const mergedAssets: { [category: string]: { name: string; url: string }[] } = { ...scannedAssets };
  customAssets.forEach(asset => {
    const cat = asset.category || 'Stiker Kustom';
    if (!mergedAssets[cat]) {
      mergedAssets[cat] = [];
    }
    mergedAssets[cat].push({ name: asset.name, url: asset.url });
  });

  const categories = Object.keys(mergedAssets);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string | null>(categories[0] || null);

  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState('#0f172a');
  const [canvasBgType, setCanvasBgType] = useState<'color' | 'gradient' | 'image'>('gradient');
  const [canvasBgImage, setCanvasBgImage] = useState<string | null>(null);
  
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(800);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const textEditorRef = useRef<HTMLTextAreaElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishCreator, setPublishCreator] = useState('');
  
  // Advanced State
  const [zoom, setZoom] = useState(0.7);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  
  // Snap guidelines state
  const [showSnapX, setShowSnapX] = useState(false);
  const [showSnapY, setShowSnapY] = useState(false);

  // Undo History state
  const [history, setHistory] = useState<DesignElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag and drop tracking
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Resize tracking
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartMouse, setResizeStartMouse] = useState({ x: 0, y: 0 });

  // Rotate tracking
  const [isRotating, setIsRotating] = useState(false);

  // Panning/drag-to-scroll tracking
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Panning event listeners
  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (viewportRef.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        viewportRef.current.scrollLeft = panStart.current.scrollLeft - dx;
        viewportRef.current.scrollTop = panStart.current.scrollTop - dy;
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking outside the elements and actual canvas container
    if (canvasContainerRef.current && !canvasContainerRef.current.contains(e.target as Node)) {
      setIsPanning(true);
      setSelectedId(null); // Deselect any active element when clicking on workspace background
      if (viewportRef.current) {
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          scrollLeft: viewportRef.current.scrollLeft,
          scrollTop: viewportRef.current.scrollTop
        };
      }
    }
  };

  // Initialize
  useEffect(() => {
    // 1. Prioritaskan load dari template (jika user klik "Gunakan Template" dari halaman Templates)
    const templateId = localStorage.getItem('template_to_load_id');
    
    if (templateId) {
      // Delay removal so it survives React 18 StrictMode double-mount
      // (StrictMode unmounts+remounts in dev, so instant removal causes the second mount to miss the ID)
      setTimeout(() => localStorage.removeItem('template_to_load_id'), 500);
      
      try {
        // Cari template dari published_templates berdasarkan ID
        const publishedStr = localStorage.getItem('published_templates');
        if (publishedStr) {
          const published = JSON.parse(publishedStr);
          const template = published.find((t: any) => t.id === templateId);
          
          if (template && template.data) {
            const data = template.data;
            
            if (data.elements && data.elements.length > 0) {
              setElements(data.elements);
              setHistory([data.elements]);
              setHistoryIndex(0);
              setCustomWidth(data.customWidth || 800);
              setCustomHeight(data.customHeight || 800);
              setCanvasBg(data.canvasBg || GRADIENTS[0].value);
              setCanvasBgType(data.canvasBgType || 'gradient');
              setCanvasBgImage(data.canvasBgImage || null);
              if (data.activePreset) setActivePreset(data.activePreset);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Failed to load template by ID", e);
      }
    }

    // 2. Jika tidak ada template, load dari draft (saved_kanvas_design) jika ada
    const savedDesignStr = localStorage.getItem('saved_kanvas_design');
    if (savedDesignStr) {
      try {
        const savedData = JSON.parse(savedDesignStr);
        if (savedData && savedData.elements) {
          setElements(savedData.elements);
          setHistory([savedData.elements]);
          setHistoryIndex(0);
          setCustomWidth(savedData.customWidth || 800);
          setCustomHeight(savedData.customHeight || 800);
          setCanvasBg(savedData.canvasBg || GRADIENTS[0].value);
          setCanvasBgType(savedData.canvasBgType || 'gradient');
          setCanvasBgImage(savedData.canvasBgImage || null);
          if (savedData.activePreset) setActivePreset(savedData.activePreset);
          return;
        }
      } catch (e) {
        console.error("Failed to load saved design", e);
      }
    }

    // 3. Fallback: Default initialization (Kanvas Kosong / Selamat Datang)
    setCanvasBg(GRADIENTS[0].value);
    const initialElements: DesignElement[] = [
      {
        id: 'welcome-text-1',
        type: 'text',
        x: 100,
        y: 250,
        width: 600,
        height: 120,
        content: 'Kanvas Kreatif',
        fontFamily: 'Poppins',
        fontSize: 56,
        fontWeight: '900',
        color: '#ffffff',
        rotate: 0,
        textAlign: 'center',
        textStrokeColor: '#6366f1',
        textStrokeWidth: 0,
      },
      {
        id: 'welcome-text-2',
        type: 'text',
        x: 100,
        y: 390,
        width: 600,
        height: 60,
        content: 'Klik elemen untuk mengedit atau geser posisinya!',
        fontFamily: 'Inter',
        fontSize: 20,
        fontWeight: '400',
        color: '#a78bfa',
        rotate: 0,
        textAlign: 'center',
        textStrokeWidth: 0,
      }
    ];
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryIndex(0);
  }, []);

  // Helper to save state in history stack
  const saveStateToHistory = (newElements: DesignElement[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(JSON.parse(JSON.stringify(history[prevIndex])));
      setSelectedId(null);
    }
  };

  const updateElementsAndHistory = (newElements: DesignElement[]) => {
    setElements(newElements);
    saveStateToHistory(newElements);
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setShowPresetsDropdown(false);
    
    // Auto adjust zoom based on size
    if (preset.width > 1200 || preset.height > 1200) {
      setZoom(0.35);
    } else if (preset.width > 800 || preset.height > 800) {
      setZoom(0.45);
    } else {
      setZoom(0.7);
    }
  };

  const handleAddText = () => {
    const newEl: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 200,
      y: 200,
      width: 400,
      height: 80,
      content: 'Teks Baru',
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: '600',
      color: '#ffffff',
      rotate: 0,
      textAlign: 'center',
      textStrokeColor: '#6366f1',
      textStrokeWidth: 0,
    };
    const updated = [...elements, newEl];
    updateElementsAndHistory(updated);
    setSelectedId(newEl.id);
  };

  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    const newEl: DesignElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 200,
      y: 200,
      width: 150,
      height: 150,
      fillColor: shapeType === 'triangle' ? '#10b981' : '#3b82f6',
      fillType: 'color',
      fillGradient: GRADIENTS[1].value,
      strokeColor: '#ffffff',
      strokeWidth: 2,
      rotate: 0,
    };
    const updated = [...elements, newEl];
    updateElementsAndHistory(updated);
    setSelectedId(newEl.id);
  };

  const handleAddLine = () => {
    const newEl: DesignElement = {
      id: `line-${Date.now()}`,
      type: 'line',
      x: 150,
      y: 350,
      width: 500,
      height: 20, // container thickness helper
      strokeColor: '#ffffff',
      strokeWidth: 4,
      lineStyle: 'solid',
      rotate: 0,
    };
    const updated = [...elements, newEl];
    updateElementsAndHistory(updated);
    setSelectedId(newEl.id);
  };

  const handleAddAsset = (url: string) => {
    const newEl: DesignElement = {
      id: `image-asset-${Date.now()}`,
      type: 'image',
      x: 200,
      y: 200,
      width: 180,
      height: 180,
      imageUrl: url,
      rotate: 0,
    };
    const updated = [...elements, newEl];
    updateElementsAndHistory(updated);
    setSelectedId(newEl.id);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newEl: DesignElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: 200,
          y: 200,
          width: 250,
          height: 250,
          imageUrl: event.target.result as string,
          rotate: 0,
        };
        const updated = [...elements, newEl];
        updateElementsAndHistory(updated);
        setSelectedId(newEl.id);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCanvasBgImage(event.target.result as string);
        setCanvasBgType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const updated = elements.filter(el => el.id !== selectedId);
    updateElementsAndHistory(updated);
    setSelectedId(null);
  };

  const updateSelectedElement = (updates: Partial<DesignElement>, skipHistory = false) => {
    if (!selectedId) return;
    const updated = elements.map(el => {
      if (el.id === selectedId) {
        return { ...el, ...updates };
      }
      return el;
    });
    setElements(updated);
    if (!skipHistory) {
      saveStateToHistory(updated);
    }
  };

  const getSelectedElement = () => {
    return elements.find(el => el.id === selectedId) || null;
  };

  // Drag and Drop Logic with Snapping
  const handleElementMouseDown = (e: React.MouseEvent, el: DesignElement) => {
    if (isResizing || isRotating) return;
    setSelectedId(el.id);
    setIsDragging(true);

    const canvasRect = canvasContainerRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const scaleX = customWidth / canvasRect.width;
    const scaleY = customHeight / canvasRect.height;

    const clickXOnCanvas = (e.clientX - canvasRect.left) * scaleX;
    const clickYOnCanvas = (e.clientY - canvasRect.top) * scaleY;

    setDragOffset({
      x: clickXOnCanvas - el.x,
      y: clickYOnCanvas - el.y,
    });
  };

  // Resize Handler Logic
  const handleResizeMouseDown = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedId(el.id);

    setResizeStartSize({
      width: el.width,
      height: el.height,
    });
    setResizeStartMouse({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Rotate Handler Logic
  const handleRotateMouseDown = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation();
    setIsRotating(true);
    setSelectedId(el.id);
  };

  // Z-Index ordering via Right Sidebar
  const moveLayerUp = (index: number) => {
    if (index >= elements.length - 1) return;
    const nextElements = [...elements];
    const temp = nextElements[index];
    nextElements[index] = nextElements[index + 1];
    nextElements[index + 1] = temp;
    updateElementsAndHistory(nextElements);
  };

  const moveLayerDown = (index: number) => {
    if (index <= 0) return;
    const nextElements = [...elements];
    const temp = nextElements[index];
    nextElements[index] = nextElements[index - 1];
    nextElements[index - 1] = temp;
    updateElementsAndHistory(nextElements);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const activeEl = getSelectedElement();
      if (!activeEl) return;

      const canvasRect = canvasContainerRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const scaleX = customWidth / canvasRect.width;
      const scaleY = customHeight / canvasRect.height;

      if (isDragging) {
        const currentXOnCanvas = (e.clientX - canvasRect.left) * scaleX;
        const currentYOnCanvas = (e.clientY - canvasRect.top) * scaleY;

        let newX = Math.round(currentXOnCanvas - dragOffset.x);
        let newY = Math.round(currentYOnCanvas - dragOffset.y);

        // SNAP DETECTOR (CENTER VERTICAL / HORIZONTAL)
        const targetCenterX = customWidth / 2;
        const targetCenterY = customHeight / 2;
        
        const elCenterX = newX + activeEl.width / 2;
        const elCenterY = newY + activeEl.height / 2;

        const snapThreshold = 12;

        if (Math.abs(elCenterX - targetCenterX) < snapThreshold) {
          newX = targetCenterX - activeEl.width / 2;
          setShowSnapX(true);
        } else {
          setShowSnapX(false);
        }

        if (Math.abs(elCenterY - targetCenterY) < snapThreshold) {
          newY = targetCenterY - activeEl.height / 2;
          setShowSnapY(true);
        } else {
          setShowSnapY(false);
        }

        newX = Math.max(-activeEl.width / 2, Math.min(customWidth - activeEl.width / 2, newX));
        newY = Math.max(-activeEl.height / 2, Math.min(customHeight - activeEl.height / 2, newY));

        updateSelectedElement({ x: newX, y: newY }, true);
      }

      if (isResizing) {
        const deltaX = (e.clientX - resizeStartMouse.x) * scaleX;
        const deltaY = (e.clientY - resizeStartMouse.y) * scaleY;

        const newWidth = Math.max(20, Math.round(resizeStartSize.width + deltaX));
        const newHeight = Math.max(5, Math.round(resizeStartSize.height + deltaY));

        updateSelectedElement({ width: newWidth, height: newHeight }, true);
      }

      if (isRotating) {
        const cx = activeEl.x + activeEl.width / 2;
        const cy = activeEl.y + activeEl.height / 2;

        const mouseXOnCanvas = (e.clientX - canvasRect.left) * scaleX;
        const mouseYOnCanvas = (e.clientY - canvasRect.top) * scaleY;

        const rad = Math.atan2(mouseYOnCanvas - cy, mouseXOnCanvas - cx);
        let deg = Math.round(rad * 180 / Math.PI);
        deg = (deg - 90 + 360) % 360;

        updateSelectedElement({ rotate: deg }, true);
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        saveStateToHistory(elements);
      }
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setShowSnapX(false);
      setShowSnapY(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, dragOffset, resizeStartMouse, resizeStartSize, selectedId, elements]);

  const handleNewCanvas = () => {
    if (window.confirm("Apakah Anda yakin ingin membuat kanvas baru? Desain saat ini yang belum disimpan akan hilang.")) {
      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedId(null);
      setCustomWidth(800);
      setCustomHeight(800);
      setActivePreset(PRESETS[0]);
      setCanvasBgType('gradient');
      setCanvasBg(GRADIENTS[0].value);
      setCanvasBgImage(null);
    }
  };

  const handleSaveToLocal = () => {
    const saveData = {
      elements,
      customWidth,
      customHeight,
      canvasBg,
      canvasBgType,
      canvasBgImage,
      activePreset
    };
    localStorage.setItem('saved_kanvas_design', JSON.stringify(saveData));
    alert('Desain berhasil disimpan ke peramban (localStorage)!');
  };

  const handlePublish = () => {
    if (!publishTitle.trim()) {
      alert('Judul template tidak boleh kosong!');
      return;
    }
    
    // Convert current canvas to thumbnail using the existing export logic to DataURL
    const canvas = document.createElement('canvas');
    // Scale down for thumbnail to save space
    const thumbScale = Math.min(1, 400 / customWidth);
    canvas.width = customWidth * thumbScale;
    canvas.height = customHeight * thumbScale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(thumbScale, thumbScale);
    
    const finishPublish = async (thumbnailUrl?: string) => {
      try {
        const newTemplate = {
          id: Date.now().toString(),
          title: publishTitle.trim(),
          description: '',
          category: 'Kustom',
          thumbnail: thumbnailUrl || '',
          creator: publishCreator.trim() || 'Anonim',
          data: {
            elements,
            customWidth,
            customHeight,
            canvasBg,
            canvasBgType,
            canvasBgImage,
            activePreset
          }
        };
        
        await publishTemplate(newTemplate);
        
        setShowPublishModal(false);
        setPublishTitle('');
        setPublishCreator('');
        alert('Template berhasil diajukan! Menunggu persetujuan admin untuk ditampilkan di galeri komunitas.');
      } catch (err: any) {
        console.error('Failed to publish template:', err);
        alert(`Gagal mengajukan template: ${err.message}`);
      }
    };

    // Draw background
    if (canvasBgType === 'color') {
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, customWidth, customHeight);
    } else if (canvasBgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, customWidth, customHeight);
      const stops = getGradientStops(canvasBg);
      grad.addColorStop(0, stops.stop1);
      grad.addColorStop(1, stops.stop2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, customWidth, customHeight);
    }

    if (canvasBgType === 'image' && canvasBgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = canvasBgImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, customWidth, customHeight);
        exportDrawElements(canvas, ctx, () => finishPublish(canvas.toDataURL('image/jpeg', 0.6)));
      };
      img.onerror = () => finishPublish();
    } else {
      exportDrawElements(canvas, ctx, () => finishPublish(canvas.toDataURL('image/jpeg', 0.6)));
    }
  };

  // Render to canvas and download PNG
  const handleExport = () => {
    const canvas = document.createElement('canvas');
    canvas.width = customWidth;
    canvas.height = customHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    if (canvasBgType === 'color') {
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, customWidth, customHeight);
      exportDrawElements(canvas, ctx);
    } else if (canvasBgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, customWidth, customHeight);
      const stops = getGradientStops(canvasBg);
      grad.addColorStop(0, stops.stop1);
      grad.addColorStop(1, stops.stop2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, customWidth, customHeight);
      exportDrawElements(canvas, ctx);
    } else if (canvasBgType === 'image' && canvasBgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = canvasBgImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, customWidth, customHeight);
        exportDrawElements(canvas, ctx);
      };
    }
  };

  const exportDrawElements = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, onComplete?: () => void) => {
    let imagesLoaded = 0;
    const imageElements = elements.filter(el => el.type === 'image');

    const drawAll = () => {
      elements.forEach(el => {
        ctx.save();

        // Translate to element center for rotation and scaling (flip)
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.translate(cx, cy);

        // Apply rotation
        if (el.rotate) {
          ctx.rotate((el.rotate * Math.PI) / 180);
        }

        // Apply flip
        const scaleX = el.flipX ? -1 : 1;
        const scaleY = el.flipY ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // Translate back
        ctx.translate(-cx, -cy);

        // Apply opacity (globalAlpha)
        ctx.globalAlpha = el.opacity !== undefined ? el.opacity / 100 : 1.0;

        // Apply blur filter and shadow glow
        ctx.filter = el.filterBlur ? `blur(${el.filterBlur}px)` : 'none';
        if (el.shadowBlur) {
          ctx.shadowColor = el.shadowColor || 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = el.shadowBlur;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        if (el.type === 'text') {
          const fontSize = el.fontSize || 32;
          const fontWeight = el.fontWeight || 'normal';
          const fontFamily = el.fontFamily || 'Poppins';
          ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
          ctx.textBaseline = 'top';

          // Set horizontal text alignment
          const alignment = el.textAlign || 'center';
          ctx.textAlign = alignment;

          let textX = el.x;
          if (alignment === 'center') {
            textX = el.x + el.width / 2;
          } else if (alignment === 'right') {
            textX = el.x + el.width;
          }

          const words = (el.content || '').split(' ');
          let line = '';
          let currentY = el.y;
          const lineHeight = fontSize * 1.25;

          const renderTextLine = (txt: string, xPos: number, yPos: number) => {
            // Draw stroke first if width > 0
            if (el.textStrokeWidth && el.textStrokeWidth > 0) {
              ctx.strokeStyle = el.textStrokeColor || '#6366f1';
              ctx.lineWidth = el.textStrokeWidth * 2;
              ctx.lineJoin = 'round';
              ctx.strokeText(txt, xPos, yPos);
            }
            // Draw fill
            ctx.fillStyle = el.color || '#ffffff';
            ctx.fillText(txt, xPos, yPos);
          };

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > el.width && n > 0) {
              renderTextLine(line, textX, currentY);
              line = words[n] + ' ';
              currentY += lineHeight;
            } else {
              line = testLine;
            }
          }
          renderTextLine(line, textX, currentY);

        } else if (el.type === 'shape') {
          // Draw fill
          if (el.fillType === 'gradient' && el.fillGradient) {
            const shapeGrad = ctx.createLinearGradient(el.x, el.y, el.x + el.width, el.y + el.height);
            const stops = getGradientStops(el.fillGradient);
            shapeGrad.addColorStop(0, stops.stop1);
            shapeGrad.addColorStop(1, stops.stop2);
            ctx.fillStyle = shapeGrad;
          } else {
            ctx.fillStyle = el.fillColor || '#3b82f6';
          }

          ctx.strokeStyle = el.strokeColor || '#ffffff';
          ctx.lineWidth = el.strokeWidth || 2;

          if (el.shapeType === 'rect') {
            ctx.fillRect(el.x, el.y, el.width, el.height);
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          } else if (el.shapeType === 'circle') {
            ctx.beginPath();
            ctx.arc(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (el.shapeType === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(el.x + el.width / 2, el.y);
            ctx.lineTo(el.x + el.width, el.y + el.height);
            ctx.lineTo(el.x, el.y + el.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else if (el.type === 'line') {
          ctx.strokeStyle = el.strokeColor || '#ffffff';
          ctx.lineWidth = el.strokeWidth || 4;
          
          if (el.lineStyle === 'dashed') {
            ctx.setLineDash([15, 10]);
          } else {
            ctx.setLineDash([]);
          }

          const centerY = el.y + el.height / 2;
          ctx.beginPath();
          ctx.moveTo(el.x, centerY);
          ctx.lineTo(el.x + el.width, centerY);
          ctx.stroke();
        } else if (el.type === 'image' && el.imageUrl) {
          const img = new Image();
          img.src = el.imageUrl;
          ctx.drawImage(img, el.x, el.y, el.width, el.height);
        }

        ctx.restore();
      });

      if (onComplete) {
        onComplete();
      } else {
        const link = document.createElement('a');
        link.download = `Desain-KanvasKita-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    if (imageElements.length === 0) {
      drawAll();
    } else {
      imageElements.forEach(el => {
        const img = new Image();
        img.src = el.imageUrl!;
        img.onload = () => {
          imagesLoaded++;
          if (imagesLoaded === imageElements.length) {
            drawAll();
          }
        };
      });
    }
  };

  const handleTriggerTextEdit = () => {
    if (textEditorRef.current) {
      textEditorRef.current.focus();
    }
  };

  const handleTriggerImageChange = () => {
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  const handleContextImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateSelectedElement({ imageUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedEl = getSelectedElement();

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <SEO
        title="Kanvas - Kanvas Kreatif KanvasKita"
        description="Berkarya dengan kanvas kosong. Buat postingan media sosial, infografis, atau kartu ucapan kustom secara gratis dan offline."
        keywords="workspace desain, editor kanvas offline, alternatif canva gratis, desainer grafis lokal"
      />

      <input 
        type="file" 
        ref={hiddenFileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleContextImageChange} 
      />

      <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Side Panel (Collapsible) */}
        <div className={`bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ${isLeftOpen ? 'w-full lg:w-80' : 'w-16'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-hidden">
            {isLeftOpen ? (
              <>
                <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">Panel Desain</h2>
                <button 
                  onClick={() => setIsLeftOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-655 cursor-pointer"
                  title="Tutup Sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsLeftOpen(true)}
                className="mx-auto p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-655 cursor-pointer"
                title="Buka Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Add elements toolbar - collapsible */}
          <div className={`p-4 flex-grow overflow-y-auto space-y-6 ${isLeftOpen ? 'block' : 'hidden lg:flex lg:flex-col lg:items-center lg:space-y-4'}`}>
            {isLeftOpen ? (
              <>
                <div>
                  <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-3">Tambah Elemen</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handleAddText}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-355 hover:border-indigo-500 transition-colors font-medium text-sm cursor-pointer"
                    >
                      <Type size={16} className="text-indigo-500" />
                      Teks
                    </button>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-355 hover:border-indigo-500 transition-colors font-medium text-sm cursor-pointer">
                      <ImageIcon size={16} className="text-pink-500" />
                      Gambar
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-3">Bentuk & Garis</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleAddShape('rect')}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Square size={16} className="text-blue-500 shrink-0" />
                      <span className="text-xs font-medium">Kotak</span>
                    </button>
                    <button 
                      onClick={() => handleAddShape('circle')}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Circle size={16} className="text-green-500 shrink-0" />
                      <span className="text-xs font-medium">Lingkaran</span>
                    </button>
                    <button 
                      onClick={() => handleAddShape('triangle')}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Triangle size={16} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-medium">Segitiga</span>
                    </button>
                    <button 
                      onClick={handleAddLine}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-500 cursor-pointer"
                    >
                      <Minus size={16} className="text-red-500 shrink-0" />
                      <span className="text-xs font-medium">Garis</span>
                    </button>
                  </div>
                </div>

                {/* Aset Galeri Bawaan (Dynamic Categories) */}
                {categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-550 uppercase tracking-wider mb-2">Galeri Elemen Pro</h3>
                    
                    {/* Category Selector Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1 mb-2.5 scrollbar-thin select-none">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedGalleryCategory(cat)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${selectedGalleryCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Image grid of selected category */}
                    {selectedGalleryCategory && mergedAssets[selectedGalleryCategory] && (
                      <div className="grid grid-cols-4 gap-1.5 max-h-[160px] overflow-y-auto p-1.5 border border-slate-150 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                        {mergedAssets[selectedGalleryCategory].map(item => (
                          <button
                            key={item.name}
                            onClick={() => handleAddAsset(item.url)}
                            className="aspect-square p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                            title={`Tambah ${item.name}`}
                          >
                            <img 
                              src={item.url} 
                              alt={item.name} 
                              className="w-full h-full object-contain" 
                              loading="lazy" 
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Property control for selected */}
                {selectedEl && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Editor Properti</h3>
                      <button 
                        onClick={handleDeleteSelected}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Hapus Elemen"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Transform & Opacity details */}
                    <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Transformasi & Opasitas</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-550 mb-1">Rotasi ({selectedEl.rotate || 0}°)</label>
                          <input 
                            type="number"
                            min="0"
                            max="360"
                            className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                            value={selectedEl.rotate || 0}
                            onChange={(e) => updateSelectedElement({ rotate: parseInt(e.target.value) % 360 || 0 })}
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <div className="flex gap-1.5 h-[30px]">
                            <button 
                              onClick={() => updateSelectedElement({ flipX: !selectedEl.flipX })}
                              className={`flex-1 flex items-center justify-center rounded-lg border text-xs font-semibold ${selectedEl.flipX ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650'}`}
                              title="Balik Kiri-Kanan"
                            >
                              <ArrowLeftRight size={14} />
                            </button>
                            <button 
                              onClick={() => updateSelectedElement({ flipY: !selectedEl.flipY })}
                              className={`flex-1 flex items-center justify-center rounded-lg border text-xs font-semibold ${selectedEl.flipY ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650'}`}
                              title="Balik Atas-Bawah"
                            >
                              <ArrowUpDown size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Opacity slider */}
                      <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opasitas / Transparansi</label>
                          <span className="text-[10px] font-bold text-indigo-500">{selectedEl.opacity !== undefined ? selectedEl.opacity : 100}%</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-indigo-500 cursor-pointer"
                          value={selectedEl.opacity !== undefined ? selectedEl.opacity : 100}
                          onChange={(e) => updateSelectedElement({ opacity: parseInt(e.target.value) })}
                        />
                      </div>

                      {/* Blur / Glow slider */}
                      <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Efek Blur / Glow</label>
                          <span className="text-[10px] font-bold text-indigo-500">{selectedEl.filterBlur || 0}px</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="150"
                          className="w-full accent-indigo-500 cursor-pointer"
                          value={selectedEl.filterBlur || 0}
                          onChange={(e) => updateSelectedElement({ filterBlur: parseInt(e.target.value) })}
                        />
                      </div>

                      {/* Drop Shadow slider & color */}
                      <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Efek Bayangan (Shadow)</label>
                          <span className="text-[10px] font-bold text-indigo-500">{selectedEl.shadowBlur || 0}px</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="50"
                          className="w-full accent-indigo-500 cursor-pointer"
                          value={selectedEl.shadowBlur || 0}
                          onChange={(e) => updateSelectedElement({ shadowBlur: parseInt(e.target.value) })}
                        />
                        {selectedEl.shadowBlur ? (
                          <div className="flex gap-1.5 items-center">
                            <input 
                              type="color"
                              className="w-6 h-6 p-0 rounded border border-slate-200 cursor-pointer"
                              value={selectedEl.shadowColor || '#000000'}
                              onChange={(e) => updateSelectedElement({ shadowColor: e.target.value })}
                            />
                            <span className="text-[10px] font-bold text-slate-450">Warna Bayangan</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {selectedEl.type === 'text' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-555 mb-1">Isi Teks</label>
                          <textarea 
                            ref={textEditorRef}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                            rows={3}
                            value={selectedEl.content || ''}
                            onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Font</label>
                            <select 
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                              value={selectedEl.fontFamily || 'Poppins'}
                              onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                            >
                              {FONTS.map(f => (
                                <option key={f.name} value={f.name}>{f.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Ukuran (px)</label>
                            <input 
                              type="number"
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs"
                              value={selectedEl.fontSize || 32}
                              onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 12 })}
                            />
                          </div>
                        </div>

                        {/* TEXT STROKE (OUTLINE) CONTROLS */}
                        <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 dark:border-indigo-500/20 space-y-2">
                          <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Stroke / Garis Tepi Teks</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-medium text-slate-555 mb-1">Tebal ({selectedEl.textStrokeWidth || 0}px)</label>
                              <input 
                                type="range"
                                min="0"
                                max="10"
                                className="w-full accent-indigo-500 cursor-pointer"
                                value={selectedEl.textStrokeWidth || 0}
                                onChange={(e) => updateSelectedElement({ textStrokeWidth: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-medium text-slate-555 mb-1">Warna Stroke</label>
                              <div className="flex gap-1">
                                <input 
                                  type="color"
                                  className="w-7 h-7 p-0 rounded-md border border-slate-200 cursor-pointer"
                                  value={selectedEl.textStrokeColor || '#6366f1'}
                                  onChange={(e) => updateSelectedElement({ textStrokeColor: e.target.value })}
                                />
                                <input 
                                  type="text"
                                  className="w-full p-0.5 text-center rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono"
                                  value={selectedEl.textStrokeColor || '#6366f1'}
                                  onChange={(e) => updateSelectedElement({ textStrokeColor: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Tebal Teks</label>
                            <select 
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                              value={selectedEl.fontWeight || 'normal'}
                              onChange={(e) => updateSelectedElement({ fontWeight: e.target.value })}
                            >
                              <option value="300">Light</option>
                              <option value="400">Regular</option>
                              <option value="600">Semibold</option>
                              <option value="800">Bold</option>
                              <option value="900">Black</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Warna Isi Teks</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="color"
                                className="w-8 h-8 p-0 rounded-md border border-slate-200 cursor-pointer overflow-hidden"
                                value={selectedEl.color || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ color: e.target.value })}
                              />
                              <input 
                                type="text"
                                className="w-full p-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono"
                                value={selectedEl.color || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ color: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedEl.type === 'shape' && (
                      <div className="space-y-3">
                        
                        {/* SHAPE FILL CONTROLS (COLOR VS GRADIENT) */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-medium text-slate-555">Pewarnaan Isi Bentuk</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => updateSelectedElement({ fillType: 'color' })}
                              className={`flex-1 py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer ${selectedEl.fillType === 'color' ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-655'}`}
                            >
                              Warna Solid
                            </button>
                            <button 
                              onClick={() => updateSelectedElement({ fillType: 'gradient' })}
                              className={`flex-1 py-1 px-2 rounded-lg border text-[10px] font-bold cursor-pointer ${selectedEl.fillType === 'gradient' ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-655'}`}
                            >
                              Warna Gradasi
                            </button>
                          </div>

                          {selectedEl.fillType === 'gradient' ? (
                            <div className="space-y-2 pt-1">
                              <div className="grid grid-cols-3 gap-1">
                                {GRADIENTS.map(grad => (
                                  <button 
                                    key={grad.name}
                                    onClick={() => updateSelectedElement({ fillGradient: grad.value })}
                                    style={{ background: grad.value }}
                                    className={`h-7 rounded-lg border cursor-pointer ${selectedEl.fillGradient === grad.value ? 'border-white scale-102 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'}`}
                                    title={grad.name}
                                  />
                                ))}
                              </div>
                              {/* Custom gradient picker */}
                              {(() => {
                                const stops = getGradientStops(selectedEl.fillGradient || GRADIENTS[0].value);
                                return (
                                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sesuaikan Warna Gradasi</label>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex gap-1 items-center">
                                        <input 
                                          type="color"
                                          className="w-6 h-6 p-0 rounded border border-slate-200 cursor-pointer"
                                          value={stops.stop1}
                                          onChange={(e) => updateSelectedElement({ fillGradient: `linear-gradient(135deg, ${e.target.value}, ${stops.stop2})` })}
                                        />
                                        <span className="text-[9px] font-mono text-slate-500">{stops.stop1}</span>
                                      </div>
                                      <div className="flex-1 flex gap-1 items-center">
                                        <input 
                                          type="color"
                                          className="w-6 h-6 p-0 rounded border border-slate-200 cursor-pointer"
                                          value={stops.stop2}
                                          onChange={(e) => updateSelectedElement({ fillGradient: `linear-gradient(135deg, ${stops.stop1}, ${e.target.value})` })}
                                        />
                                        <span className="text-[9px] font-mono text-slate-500">{stops.stop2}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="flex gap-1.5 pt-1">
                              <input 
                                type="color"
                                className="w-8 h-8 p-0 rounded-md border border-slate-250 cursor-pointer"
                                value={selectedEl.fillColor || '#3b82f6'}
                                onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                              />
                              <input 
                                type="text"
                                className="w-full p-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono"
                                value={selectedEl.fillColor || '#3b82f6'}
                                onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Garis Tepi (Stroke)</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="color"
                                className="w-8 h-8 p-0 rounded-md border border-slate-250 cursor-pointer"
                                value={selectedEl.strokeColor || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                              />
                              <input 
                                type="text"
                                className="w-full p-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono"
                                value={selectedEl.strokeColor || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Tebal Garis ({selectedEl.strokeWidth}px)</label>
                            <input 
                              type="range"
                              min="0"
                              max="20"
                              className="w-full accent-indigo-500 cursor-pointer"
                              value={selectedEl.strokeWidth || 0}
                              onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedEl.type === 'line' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Tipe Garis</label>
                            <select 
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                              value={selectedEl.lineStyle || 'solid'}
                              onChange={(e) => updateSelectedElement({ lineStyle: e.target.value as 'solid' | 'dashed' })}
                            >
                              <option value="solid">Lurus (Solid)</option>
                              <option value="dashed">Putus-Putus (Dashed)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-555 mb-1">Warna</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="color"
                                className="w-8 h-8 p-0 rounded-md border border-slate-255 cursor-pointer"
                                value={selectedEl.strokeColor || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                              />
                              <input 
                                type="text"
                                className="w-full p-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-mono"
                                value={selectedEl.strokeColor || '#ffffff'}
                                onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-555 mb-1">Ketebalan Garis ({selectedEl.strokeWidth}px)</label>
                          <input 
                            type="range"
                            min="1"
                            max="30"
                            className="w-full accent-indigo-500 cursor-pointer"
                            value={selectedEl.strokeWidth || 4}
                            onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) || 1 })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Canvas Background customizer */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-450 dark:text-slate-555 uppercase tracking-wider">Latar Belakang</h3>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCanvasBgType('color')}
                      className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${canvasBgType === 'color' ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-950'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setCanvasBgType('gradient')}
                      className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${canvasBgType === 'gradient' ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-950'}`}
                    >
                      Gradasi
                    </button>
                    <label className={`flex-1 py-1.5 rounded-lg border text-center text-[11px] font-bold cursor-pointer ${canvasBgType === 'image' ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-950'}`}>
                      Gambar
                      <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                    </label>
                  </div>

                  {canvasBgType === 'color' && (
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        className="w-10 h-10 p-0 rounded-md border border-slate-200 dark:border-slate-850 cursor-pointer"
                        value={canvasBg.startsWith('linear') ? '#0f172a' : canvasBg}
                        onChange={(e) => setCanvasBg(e.target.value)}
                      />
                      <input 
                        type="text"
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm font-mono text-center"
                        value={canvasBg.startsWith('linear') ? '#0f172a' : canvasBg}
                        onChange={(e) => setCanvasBg(e.target.value)}
                      />
                    </div>
                  )}

                  {canvasBgType === 'gradient' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {GRADIENTS.map(grad => (
                          <button 
                            key={grad.name}
                            onClick={() => setCanvasBg(grad.value)}
                            style={{ background: grad.value }}
                            className={`h-10 rounded-xl border-2 cursor-pointer transition-all ${canvasBg === grad.value ? 'border-[#ffffff] scale-102' : 'border-transparent opacity-85 hover:opacity-100'}`}
                            title={grad.name}
                          />
                        ))}
                      </div>
                      {/* Custom canvas bg gradient picker */}
                      {(() => {
                        const stops = getGradientStops(canvasBg.startsWith('linear') ? canvasBg : GRADIENTS[0].value);
                        return (
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sesuaikan Warna Gradasi Background</label>
                            <div className="flex gap-2">
                              <div className="flex-grow flex gap-1 items-center">
                                <input 
                                  type="color"
                                  className="w-7 h-7 p-0 rounded-md border border-slate-200 cursor-pointer"
                                  value={stops.stop1}
                                  onChange={(e) => setCanvasBg(`linear-gradient(135deg, ${e.target.value}, ${stops.stop2})`)}
                                />
                                <span className="text-[10px] font-mono text-slate-500">{stops.stop1}</span>
                              </div>
                              <div className="flex-grow flex gap-1 items-center">
                                <input 
                                  type="color"
                                  className="w-7 h-7 p-0 rounded-md border border-slate-200 cursor-pointer"
                                  value={stops.stop2}
                                  onChange={(e) => setCanvasBg(`linear-gradient(135deg, ${stops.stop1}, ${e.target.value})`)}
                                />
                                <span className="text-[10px] font-mono text-slate-500">{stops.stop2}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Collapsed mode
              <div className="flex flex-col items-center gap-4 w-full">
                <button 
                  onClick={handleAddText}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-indigo-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah Teks"
                >
                  <Type size={20} />
                </button>
                <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-pink-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 my-2" />
                <button 
                  onClick={() => handleAddShape('rect')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-blue-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah Kotak"
                >
                  <Square size={18} />
                </button>
                <button 
                  onClick={() => handleAddShape('circle')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-green-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah Lingkaran"
                >
                  <Circle size={18} />
                </button>
                <button 
                  onClick={() => handleAddShape('triangle')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-amber-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah Segitiga"
                >
                  <Triangle size={18} />
                </button>
                <button 
                  onClick={handleAddLine}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-red-500 hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                  title="Tambah Garis"
                >
                  <Minus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas Display Area */}
        <div className="flex-grow bg-slate-100 dark:bg-slate-950/40 p-4 md:p-6 flex flex-col justify-between overflow-auto relative">
          
          {/* Top Options Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 z-30 mb-4 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <button 
                  onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-bold text-xs cursor-pointer select-none"
                >
                  <Layout size={14} className="text-indigo-500" />
                  <span>{activePreset.name}</span>
                  <ChevronDown size={14} />
                </button>

                {showPresetsDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 py-1.5 select-none">
                    {PRESETS.map(p => (
                      <button 
                        key={p.name}
                        onClick={() => handlePresetSelect(p)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors font-semibold cursor-pointer"
                      >
                        {p.name} ({p.width}x{p.height}px)
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-355 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                title="Batal aksi sebelumnya (Undo)"
              >
                <Undo2 size={14} />
                <span className="text-xs font-bold">Undo</span>
              </button>
            </div>

            {/* ZOOM SLIDER & CONTROL */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={handleNewCanvas}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Kanvas Baru
                </button>
                <button 
                  onClick={handleSaveToLocal}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Simpan
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 select-none hidden lg:flex">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-550">Zoom: {Math.round(zoom * 100)}%</span>
                <input 
                  type="range"
                  min="0.15"
                  max="2.0"
                  step="0.05"
                  className="w-20 md:w-28 h-1 accent-indigo-500 rounded-lg cursor-pointer"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
              <button 
                onClick={async () => {
                  const user = await getCurrentUser();
                  if (!user) {
                    alert('Silakan masuk atau daftar akun terlebih dahulu untuk mempublikasikan template!');
                    navigate('/auth');
                  } else {
                    setPublishCreator(user.name);
                    setShowPublishModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#d946ef] hover:bg-[#c026d3] text-white font-bold text-xs shadow-md hover:scale-102 duration-200 cursor-pointer"
              >
                Publish
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:scale-102 duration-200 cursor-pointer"
              >
                <Download size={14} />
                Unduh
              </button>
            </div>
          </div>

          {/* Canvas Board Area with interactive guidelines */}
          <div 
            ref={viewportRef}
            onMouseDown={handleViewportMouseDown}
            className={`flex-grow flex overflow-auto p-32 md:p-48 relative min-h-[300px] select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            
            {showSnapX && (
              <div 
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '1.5px',
                  zIndex: 25,
                }}
                className="bg-red-500 border-l border-dashed border-red-400 pointer-events-none"
              />
            )}

            {showSnapY && (
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1.5px',
                  zIndex: 25,
                }}
                className="bg-red-500 border-t border-dashed border-red-400 pointer-events-none"
              />
            )}

            {/* Wrapper element that matches scaled dimensions so scrollbars function perfectly */}
            <div
              style={{
                width: `${customWidth * zoom}px`,
                height: `${customHeight * zoom}px`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                margin: 'auto',
              }}
            >
              <div 
                ref={canvasContainerRef}
                style={{
                  width: `${customWidth}px`,
                  height: `${customHeight}px`,
                  background: canvasBgType === 'image' && canvasBgImage ? `url(${canvasBgImage}) center/cover no-repeat` : canvasBgType === 'color' ? canvasBg : '',
                  backgroundImage: canvasBgType === 'gradient' ? canvasBg : '',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  position: 'absolute',
                }}
                onClick={() => setSelectedId(null)}
                className="shadow-2xl overflow-hidden shrink-0 border border-slate-700/50 transition-transform rounded-lg"
              >
              {/* Render Elements inside the Board */}
              {elements.map((el) => {
                const isSelected = el.id === selectedId;
                
                // For Triangle SVG gradients
                const gradientStops = el.fillGradient ? getGradientStops(el.fillGradient) : null;
                const elFilter = `${el.filterBlur ? `blur(${el.filterBlur}px)` : ''} ${el.shadowBlur ? `drop-shadow(0px 4px ${el.shadowBlur}px ${el.shadowColor || 'rgba(0,0,0,0.3)'})` : ''}`.trim() || undefined;

                return (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      transform: `rotate(${el.rotate || 0}deg) scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`,
                      opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
                    }}
                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute flex select-none group cursor-move ${isSelected ? 'border-2 border-indigo-500 z-30' : 'hover:border border-indigo-500/40 z-10'}`}
                  >
                    
                    

                    {/* Lencana sudut derajat */}
                    {isSelected && isRotating && (
                      <div 
                        style={{
                          transform: `translate(-50%, -50%) rotate(${-(el.rotate || 0)}deg) scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`,
                        }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-indigo-600 text-white font-black text-xs px-2 py-1 rounded-md shadow-md animate-scale-in"
                      >
                        {el.rotate || 0}°
                      </div>
                    )}

                    {/* Render Text element */}
                    {el.type === 'text' && (
                      <div 
                        style={{
                          fontFamily: `"${el.fontFamily}", sans-serif`,
                          fontSize: `${el.fontSize}px`,
                          fontWeight: el.fontWeight || '600',
                          lineHeight: 1.15,
                          textAlign: el.textAlign || 'center',
                          filter: elFilter,
                        }}
                        className="relative w-full h-full break-words overflow-visible"
                      >
                        {/* Layer Stroke (di bawah font) */}
                        {(el.textStrokeWidth ?? 0) > 0 && (
                          <div 
                            style={{
                              WebkitTextStroke: `${(el.textStrokeWidth || 0) * 2}px ${el.textStrokeColor || '#6366f1'}`,
                              WebkitTextFillColor: el.textStrokeColor || '#6366f1',
                            }}
                            className="absolute inset-0 z-0 pointer-events-none"
                          >
                            {el.content}
                          </div>
                        )}
                        {/* Layer Fill (di atas font) */}
                        <div 
                          style={{
                            color: el.color || '#ffffff',
                          }}
                          className="relative z-10"
                        >
                          {el.content}
                        </div>
                      </div>
                    )}

                    {/* Render Shapes */}
                    {el.type === 'shape' && el.shapeType === 'rect' && (
                      <div 
                        style={{
                          background: el.fillType === 'gradient' && el.fillGradient ? el.fillGradient : undefined,
                          backgroundColor: el.fillType !== 'gradient' ? el.fillColor : undefined,
                          borderColor: el.strokeColor,
                          borderWidth: `${el.strokeWidth}px`,
                          borderStyle: 'solid',
                          filter: elFilter,
                        }}
                        className="w-full h-full"
                      />
                    )}

                    {el.type === 'shape' && el.shapeType === 'circle' && (
                      <div 
                        style={{
                          background: el.fillType === 'gradient' && el.fillGradient ? el.fillGradient : undefined,
                          backgroundColor: el.fillType !== 'gradient' ? el.fillColor : undefined,
                          borderColor: el.strokeColor,
                          borderWidth: `${el.strokeWidth}px`,
                          borderStyle: 'solid',
                          filter: elFilter,
                        }}
                        className="w-full h-full rounded-full"
                      />
                    )}

                    {el.type === 'shape' && el.shapeType === 'triangle' && (
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: elFilter }}>
                        {gradientStops && (
                          <defs>
                            <linearGradient id={`triangle-grad-${el.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={gradientStops.stop1} />
                              <stop offset="100%" stopColor={gradientStops.stop2} />
                            </linearGradient>
                          </defs>
                        )}
                        <polygon 
                          points="50,0 100,100 0,100" 
                          fill={el.fillType === 'gradient' && el.fillGradient ? `url(#triangle-grad-${el.id})` : el.fillColor} 
                          stroke={el.strokeColor} 
                          strokeWidth={el.strokeWidth} 
                        />
                      </svg>
                    )}

                    {/* Render custom Line */}
                    {el.type === 'line' && (
                      <div className="w-full h-full flex items-center justify-center relative" style={{ filter: elFilter }}>
                        <div 
                          style={{
                            width: '100%',
                            height: '0px',
                            borderTop: `${el.strokeWidth}px ${el.lineStyle === 'dashed' ? 'dashed' : 'solid'} ${el.strokeColor || '#ffffff'}`,
                          }}
                        />
                      </div>
                    )}

                    {/* Render User uploaded sticker */}
                    {el.type === 'image' && el.imageUrl && (
                      <img 
                        src={el.imageUrl} 
                        alt="User sticker" 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                        style={{ filter: elFilter }}
                      />
                    )}

                    {/* Corner resize handle */}
                    {isSelected && (
                      <div 
                        onMouseDown={(e) => handleResizeMouseDown(e, el)}
                        className="absolute bottom-[-6px] right-[-6px] w-4.5 h-4.5 bg-indigo-500 border border-white rounded-full cursor-se-resize flex items-center justify-center shadow-lg z-45 hover:scale-110 active:scale-95 duration-100"
                        title="Tarik untuk mengubah ukuran"
                      >
                        <Maximize2 size={8} className="text-white" />
                      </div>
                    )}

                    {/* Rotation Handle */}
                    {isSelected && (
                      <div 
                        onMouseDown={(e) => handleRotateMouseDown(e, el)}
                        style={{
                          left: '50%',
                          transform: 'translateX(-50%)',
                          bottom: '-28px'
                        }}
                        className="absolute w-6 h-6 bg-slate-900 dark:bg-white text-slate-300 dark:text-slate-655 border border-slate-700 dark:border-slate-200 rounded-full cursor-alias flex items-center justify-center shadow-lg z-45 hover:scale-110 hover:text-indigo-500 transition-all duration-100"
                        title="Tarik untuk memutar elemen"
                      >
                        <RotateCw size={10} />
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
              
              {/* Render Floating Toolbar here (outside the canvas overflow-hidden) */}
              {(() => {
                const selectedEl = elements.find(el => el.id === selectedId);
                if (!selectedEl) return null;
                
                const isNearTop = selectedEl.y < 60;
                const toolbarTop = isNearTop 
                  ? (selectedEl.y + selectedEl.height) * zoom + 12 
                  : selectedEl.y * zoom - 48;
                
                return (
                  <div 
                    style={{
                      position: 'absolute',
                      left: `${(selectedEl.x + selectedEl.width / 2) * zoom}px`,
                      top: `${toolbarTop}px`,
                      transform: 'translateX(-50%)',
                      zIndex: 50,
                    }}
                    className="bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-800 dark:border-slate-200 text-xs shrink-0 select-none cursor-default font-semibold backdrop-blur-xs"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {/* Action Hapus */}
                    <button 
                      onClick={handleDeleteSelected}
                      className="hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer"
                      title="Hapus Elemen"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Action Edit (Teks) */}
                    {selectedEl.type === 'text' && (
                      <button 
                        onClick={handleTriggerTextEdit}
                        className="hover:text-indigo-500 transition-colors p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                        title="Edit Tulisan"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}

                    {/* TEXT ALIGNMENT CONTROLS (Only for Text elements) */}
                    {selectedEl.type === 'text' && (
                      <>
                        <div className="w-[1px] h-3 bg-slate-700 dark:bg-slate-300" />
                        <button 
                          onClick={() => {
                            const current = selectedEl.textAlign || 'center';
                            let next: 'left' | 'center' | 'right' = 'center';
                            if (current === 'left') next = 'center';
                            else if (current === 'center') next = 'right';
                            else if (current === 'right') next = 'left';
                            updateSelectedElement({ textAlign: next });
                          }}
                          className="p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer text-indigo-500"
                          title={
                            (selectedEl.textAlign || 'center') === 'left' ? 'Rata Kiri (Klik untuk ubah)' :
                            (selectedEl.textAlign || 'center') === 'center' ? 'Rata Tengah (Klik untuk ubah)' : 'Rata Kanan (Klik untuk ubah)'
                          }
                        >
                          {(selectedEl.textAlign || 'center') === 'left' && <AlignLeft size={14} />}
                          {(selectedEl.textAlign || 'center') === 'center' && <AlignCenter size={14} />}
                          {(selectedEl.textAlign || 'center') === 'right' && <AlignRight size={14} />}
                        </button>
                      </>
                    )}

                    {/* Action Ganti Gambar (Gambar) */}
                    {selectedEl.type === 'image' && (
                      <button 
                        onClick={handleTriggerImageChange}
                        className="hover:text-pink-500 transition-colors p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer text-[10px] font-bold"
                        title="Ganti Gambar"
                      >
                        Change
                      </button>
                    )}

                    <div className="w-[1px] h-3 bg-slate-700 dark:bg-slate-300" />

                    {/* Flip Horizontal */}
                    <button 
                      onClick={() => updateSelectedElement({ flipX: !selectedEl.flipX })}
                      className={`p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer ${selectedEl.flipX ? 'text-indigo-500' : ''}`}
                      title="Balik Kiri-Kanan"
                    >
                      <ArrowLeftRight size={14} />
                    </button>

                    {/* Flip Vertical */}
                    <button 
                      onClick={() => updateSelectedElement({ flipY: !selectedEl.flipY })}
                      className={`p-1 rounded-md hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer ${selectedEl.flipY ? 'text-indigo-500' : ''}`}
                      title="Balik Atas-Bawah"
                    >
                      <ArrowUpDown size={14} />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sizing description footer */}
          <div className="text-center text-xs font-semibold text-slate-450 dark:text-slate-555 select-none shrink-0">
            Resolusi Canvas: {customWidth}x{customHeight}px | Geser elemen dekat ke pusat untuk snapping otomatis.
          </div>
        </div>

        {/* Right Side Panel (Layers Management) */}
        <div className={`bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ${isRightOpen ? 'w-full lg:w-64' : 'w-12'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-hidden">
            {isRightOpen ? (
              <>
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white truncate">
                  <Layers size={15} className="text-indigo-500" />
                  <span>Pengelola Layer</span>
                </div>
                <button 
                  onClick={() => setIsRightOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-655 cursor-pointer"
                  title="Sembunyikan Layer"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsRightOpen(true)}
                className="mx-auto p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-655 cursor-pointer"
                title="Buka Layer"
              >
                <ChevronLeft size={16} />
              </button>
            )}
          </div>

          {/* Layer listing */}
          <div className={`p-4 flex-grow overflow-y-auto space-y-2 select-none ${isRightOpen ? 'block' : 'hidden'}`}>
            {elements.length === 0 ? (
              <div className="text-center py-10 text-xs font-medium text-slate-400 dark:text-slate-550">
                Belum ada elemen
              </div>
            ) : (
              [...elements].reverse().map((el) => {
                const originalIndex = elements.findIndex(item => item.id === el.id);
                const isSelected = el.id === selectedId;

                let displayName = 'Elemen';
                if (el.type === 'text') displayName = `Teks: "${el.content?.slice(0, 12)}..."`;
                if (el.type === 'image') displayName = 'Gambar Stiker';
                if (el.type === 'line') displayName = `Garis (${el.lineStyle === 'dashed' ? 'Dashed' : 'Solid'})`;
                if (el.type === 'shape') {
                  if (el.shapeType === 'rect') displayName = 'Bentuk: Kotak';
                  if (el.shapeType === 'circle') displayName = 'Bentuk: Lingkaran';
                  if (el.shapeType === 'triangle') displayName = 'Bentuk: Segitiga';
                }

                return (
                  <div 
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-355 bg-slate-50 dark:bg-slate-950'}`}
                  >
                    <span className="text-[11px] font-bold truncate flex-grow text-left">
                      {displayName}
                    </span>
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => moveLayerUp(originalIndex)}
                        disabled={originalIndex >= elements.length - 1}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-750 text-slate-650 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Naikkan Layer"
                      >
                        <ArrowUp size={10} />
                      </button>
                      <button 
                        onClick={() => moveLayerDown(originalIndex)}
                        disabled={originalIndex <= 0}
                        className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-750 text-slate-650 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Turunkan Layer"
                      >
                        <ArrowDown size={10} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Publish */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Publikasi Template</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Bagikan desain Anda agar bisa digunakan oleh orang lain sebagai template. 
              Sebagai mockup, data akan disimpan di peramban Anda.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Judul Template <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Cth: Poster Kemerdekaan"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nama Pembuat</label>
                <input 
                  type="text" 
                  value={publishCreator}
                  onChange={(e) => setPublishCreator(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Kosongkan untuk Anonim"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-8">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handlePublish}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:scale-105 transition-transform"
              >
                Publikasikan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
