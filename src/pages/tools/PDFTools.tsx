import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Download,
  RefreshCw, 
  FileImage, 
  ShieldCheck, 
  Zap, 
  X, 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Trash2 
} from 'lucide-react';
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import { SEO } from '../../components/SEO';

type PDFTab = 'images-to-pdf' | 'merge-pdf' | 'split-pdf' | 'compress-pdf';

export const PDFTools = () => {
  const [activeTab, setActiveTab] = useState<PDFTab>('images-to-pdf');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 1. Gambar ke PDF States
  const [imagesList, setImagesList] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<string>('a4'); // a4, letter, fit
  const [pageOrientation, setPageOrientation] = useState<string>('portrait'); // portrait, landscape
  const [margin, setMargin] = useState<number>(0); // 0, 10, 20
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const [dragActiveImages, setDragActiveImages] = useState<boolean>(false);

  // 2. Gabung PDF States
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [dragActivePdfs, setDragActivePdfs] = useState<boolean>(false);

  // 3. Pisah PDF States
  const [singlePdfFile, setSinglePdfFile] = useState<File | null>(null);
  const [splitRange, setSplitRange] = useState<string>('1-2');
  const [singlePdfInfo, setSinglePdfInfo] = useState<{ pages: number; size: number } | null>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);
  const [dragActiveSplit, setDragActiveSplit] = useState<boolean>(false);

  // 4. Kompres PDF States
  const [compressPdfFile, setCompressPdfFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<string>('medium'); // low, medium, high
  const compressInputRef = useRef<HTMLInputElement>(null);
  const [dragActiveCompress, setDragActiveCompress] = useState<boolean>(false);

  // Previews & Outputs
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [convertedPdfSize, setConvertedPdfSize] = useState<number>(0);
  const [convertedPdfName, setConvertedPdfName] = useState<string>('');
  
  const [compressedPdfUrl, setCompressedPdfUrl] = useState<string | null>(null);
  const [compressedPdfSize, setCompressedPdfSize] = useState<number>(0);
  const [originalPdfSize, setOriginalPdfSize] = useState<number>(0);

  // Clear errors and clean up object URLs when switching tabs
  useEffect(() => {
    setError('');
    setProgress(0);
    setProgressStage('');
    
    // Revoke previous URLs to avoid memory leaks
    if (convertedPdfUrl) {
      URL.revokeObjectURL(convertedPdfUrl);
      setConvertedPdfUrl(null);
      setConvertedPdfSize(0);
      setConvertedPdfName('');
    }
    if (compressedPdfUrl) {
      URL.revokeObjectURL(compressedPdfUrl);
      setCompressedPdfUrl(null);
      setCompressedPdfSize(0);
      setOriginalPdfSize(0);
    }
  }, [activeTab]);

  // Specific cleanups on URL changes
  useEffect(() => {
    return () => {
      if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
    };
  }, [convertedPdfUrl]);

  useEffect(() => {
    return () => {
      if (compressedPdfUrl) URL.revokeObjectURL(compressedPdfUrl);
    };
  }, [compressedPdfUrl]);

  // Utility to format sizes
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to parse page range string (e.g. "1-3, 5" -> [0, 1, 2, 4])
  const parsePageRanges = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');
    
    for (let part of parts) {
      part = part.trim();
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i++) {
            if (i >= 1 && i <= maxPages) {
              pages.add(i - 1); // 0-indexed
            }
          }
        }
      } else {
        const page = parseInt(part, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pages.add(page - 1); // 0-indexed
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  // ==========================================
  // 1. Gambar ke PDF Handlers
  // ==========================================
  const handleImagesUpload = (files: FileList | null) => {
    if (!files) return;
    const newList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        newList.push(files[i]);
      }
    }
    setImagesList((prev) => [...prev, ...newList]);
  };

  const handleDragImages = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveImages(true);
    } else if (e.type === "dragleave") {
      setDragActiveImages(false);
    }
  };

  const handleDropImages = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveImages(false);
    if (e.dataTransfer.files) {
      handleImagesUpload(e.dataTransfer.files);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === imagesList.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...imagesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImagesList(updated);
  };

  const removeImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper to load and compress an image to JPEG format before embedding
  const compressImageToJpg = (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Gagal memuat canvas context'));
            return;
          }
          
          // Limit max dimension to 2000px for reasonable PDF size
          const maxDim = 2000;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Fill canvas with white color (crucial for transparent PNGs)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            async (blob) => {
              if (blob) {
                const buffer = await blob.arrayBuffer();
                resolve(new Uint8Array(buffer));
              } else {
                reject(new Error('Gagal mengonversi canvas ke Blob'));
              }
            },
            'image/jpeg',
            0.85 // High quality compression
          );
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file berkas'));
    });
  };

  const handleResetImagesToPdf = () => {
    setImagesList([]);
    if (convertedPdfUrl) {
      URL.revokeObjectURL(convertedPdfUrl);
    }
    setConvertedPdfUrl(null);
    setConvertedPdfSize(0);
    setConvertedPdfName('');
    setProgress(0);
    setProgressStage('');
  };

  const handleImagesToPdf = async () => {
    if (imagesList.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStage('Menyiapkan gambar...');
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < imagesList.length; i++) {
        const file = imagesList[i];
        setProgressStage(`Mengompres gambar ${i + 1} dari ${imagesList.length}...`);
        
        // Compress image first (converts PNG/JPG to optimized JPEG)
        const jpgBytes = await compressImageToJpg(file);
        const pdfImage = await pdfDoc.embedJpg(jpgBytes);

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pageWidth = imgWidth;
        let pageHeight = imgHeight;

        if (pageSize === 'a4') {
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (pageSize === 'letter') {
          pageWidth = 612;
          pageHeight = 792;
        }

        // Swap for landscape
        if (pageSize !== 'fit' && pageOrientation === 'landscape') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const marginVal = Number(margin);
        const printableWidth = pageWidth - marginVal * 2;
        const printableHeight = pageHeight - marginVal * 2;

        let drawWidth = printableWidth;
        let drawHeight = printableHeight;

        const imgRatio = imgWidth / imgHeight;
        const pageRatio = printableWidth / printableHeight;

        if (imgRatio > pageRatio) {
          drawHeight = printableWidth / imgRatio;
        } else {
          drawWidth = printableHeight * imgRatio;
        }

        const x = marginVal + (printableWidth - drawWidth) / 2;
        const y = marginVal + (printableHeight - drawHeight) / 2;

        page.drawImage(pdfImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(Math.round(((i + 1) / imagesList.length) * 100));
      }

      setProgressStage('Menyusun berkas PDF...');
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      if (convertedPdfUrl) {
        URL.revokeObjectURL(convertedPdfUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setConvertedPdfUrl(url);
      setConvertedPdfSize(blob.size);
      setConvertedPdfName('compiled_images_kanvaskita.pdf');
      
      setProgress(100);
      setProgressStage('Selesai!');
    } catch (err) {
      console.error(err);
      setError('Gagal mengonversi gambar ke PDF. Pastikan format gambar valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // 2. Gabung PDF Handlers
  // ==========================================
  const handlePdfsUpload = (files: FileList | null) => {
    if (!files) return;
    const newList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.toLowerCase().endsWith('.pdf')) {
        newList.push(files[i]);
      }
    }
    setPdfFiles((prev) => [...prev, ...newList]);
  };

  const handleDragPdfs = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePdfs(true);
    } else if (e.type === "dragleave") {
      setDragActivePdfs(false);
    }
  };

  const handleDropPdfs = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePdfs(false);
    if (e.dataTransfer.files) {
      handlePdfsUpload(e.dataTransfer.files);
    }
  };

  const movePdf = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pdfFiles.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pdfFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPdfFiles(updated);
  };

  const removePdf = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMergePdfs = async () => {
    if (pdfFiles.length < 2) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStage('Memuat dokumen PDF...');
    setError('');

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const bytes = new Uint8Array(await file.arrayBuffer());
        const srcPdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(Math.round(((i + 1) / pdfFiles.length) * 100));
      }

      setProgressStage('Menyusun file gabungan...');
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_document_kanvaskita.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Gagal menggabungkan berkas PDF. Silakan periksa kompatibilitas berkas.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // 3. Pisah PDF Handlers
  // ==========================================
  const handleSplitUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Harap unggah berkas dengan format PDF saja.');
      return;
    }
    
    setSinglePdfFile(file);
    setError('');
    
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes);
      setSinglePdfInfo({
        pages: pdf.getPageCount(),
        size: file.size
      });
      setSplitRange(`1-${Math.min(pdf.getPageCount(), 2)}`);
    } catch (err) {
      console.error(err);
      setError('Gagal membaca dokumen PDF. File mungkin rusak atau terenkripsi.');
      setSinglePdfFile(null);
      setSinglePdfInfo(null);
    }
  };

  const handleDragSplit = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveSplit(true);
    } else if (e.type === "dragleave") {
      setDragActiveSplit(false);
    }
  };

  const handleDropSplit = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveSplit(false);
    if (e.dataTransfer.files) {
      handleSplitUpload(e.dataTransfer.files);
    }
  };

  const handleSplitPdf = async () => {
    if (!singlePdfFile || !singlePdfInfo) return;
    setIsProcessing(true);
    setProgress(20);
    setProgressStage('Memotong halaman...');
    setError('');

    try {
      const bytes = new Uint8Array(await singlePdfFile.arrayBuffer());
      const srcPdf = await PDFDocument.load(bytes);
      const totalPages = srcPdf.getPageCount();
      
      const selectedIndices = parsePageRanges(splitRange, totalPages);
      
      if (selectedIndices.length === 0) {
        setError('Rentang halaman tidak valid atau di luar batas jumlah halaman.');
        setIsProcessing(false);
        return;
      }

      setProgress(50);
      const splitPdf = await PDFDocument.create();
      const copiedPages = await splitPdf.copyPages(srcPdf, selectedIndices);
      copiedPages.forEach((page) => splitPdf.addPage(page));
      
      setProgress(80);
      const pdfBytes = await splitPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_${singlePdfFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
      setProgress(100);
      setProgressStage('Selesai!');
    } catch (err) {
      console.error(err);
      setError('Gagal memisahkan halaman PDF. Silakan coba kembali.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // 4. Kompres PDF Handlers
  // ==========================================
  const handleCompressUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Harap unggah berkas PDF saja.');
      return;
    }
    setCompressPdfFile(file);
    setError('');
  };

  const handleDragCompress = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveCompress(true);
    } else if (e.type === "dragleave") {
      setDragActiveCompress(false);
    }
  };

  const handleDropCompress = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCompress(false);
    if (e.dataTransfer.files) {
      handleCompressUpload(e.dataTransfer.files);
    }
  };

  const getPdfSavings = (): { percent: number; text: string } => {
    if (originalPdfSize === 0 || compressedPdfSize === 0) return { percent: 0, text: '' };
    const diff = originalPdfSize - compressedPdfSize;
    const percent = Math.round((diff / originalPdfSize) * 100);
    return {
      percent,
      text: percent > 0 ? `Hemat ${percent}%` : `Ukuran bertambah ${Math.abs(percent)}%`
    };
  };

  const pdfSavings = getPdfSavings();

  const handleResetCompressPdf = () => {
    setCompressPdfFile(null);
    if (compressedPdfUrl) {
      URL.revokeObjectURL(compressedPdfUrl);
    }
    setCompressedPdfUrl(null);
    setCompressedPdfSize(0);
    setOriginalPdfSize(0);
    setProgress(0);
    setProgressStage('');
  };

  const handleCompressPdf = async () => {
    if (!compressPdfFile) return;
    setIsProcessing(true);
    setProgress(0);
    setProgressStage('Membaca berkas PDF...');
    setError('');

    try {
      const bytes = new Uint8Array(await compressPdfFile.arrayBuffer());
      const pdfDoc = await PDFDocument.load(bytes);
      
      const resolveObj = (val: any) => val ? pdfDoc.context.lookup(val) : undefined;

      // Safe wrapper for DecompressionStream
      const decompressZlibStream = async (compressedBytes: Uint8Array): Promise<Uint8Array> => {
        const DecompressionStreamClass = (window as any).DecompressionStream || (globalThis as any).DecompressionStream;
        if (!DecompressionStreamClass) {
          throw new Error('DecompressionStream tidak didukung di browser ini.');
        }
        const ds = new DecompressionStreamClass('deflate');
        const writer = ds.writable.getWriter();
        writer.write(compressedBytes);
        writer.close();
        
        const response = new Response(ds.readable);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      };
      
      let scaleFactor = 0.7;
      let qualityFactor = 0.6;
      if (compressLevel === 'high') { // High Quality = low compression
        scaleFactor = 0.85;
        qualityFactor = 0.75;
      } else if (compressLevel === 'low') { // Low Quality = high compression (Max Compression)
        scaleFactor = 0.4;
        qualityFactor = 0.3;
      }

      const objects = pdfDoc.context.enumerateIndirectObjects();
      let processedImages = 0;
      let totalImages = 0;

      // Count compressible images (JPEGs & supported FlateDecode PNGs)
      objects.forEach(([_, pdfObject]) => {
        if (pdfObject instanceof PDFRawStream) {
          const dict = pdfObject.dict;
          const subtype = resolveObj(dict.get(PDFName.of('Subtype')));
          if (subtype === PDFName.of('Image')) {
            const filter = resolveObj(dict.get(PDFName.of('Filter')));
            
            let isCompressible = false;
            if (filter === PDFName.of('DCTDecode')) {
              isCompressible = true;
            } else if (filter === PDFName.of('FlateDecode')) {
              const colorSpace = resolveObj(dict.get(PDFName.of('ColorSpace')));
              const bpc = resolveObj(dict.get(PDFName.of('BitsPerComponent')));
              const isStandardBpc = !bpc || (bpc as any).asNumber() === 8;
              const isSupportedCs = colorSpace === PDFName.of('DeviceRGB') || 
                                    colorSpace === PDFName.of('RGB') || 
                                    colorSpace === PDFName.of('DeviceGray') || 
                                    colorSpace === PDFName.of('Gray') || 
                                    colorSpace === PDFName.of('DeviceCMYK') || 
                                    colorSpace === PDFName.of('CMYK');
              if (isStandardBpc && isSupportedCs) {
                isCompressible = true;
              }
            } else if (filter && typeof filter === 'object' && 'size' in filter && 'get' in filter) {
              const array = filter as any;
              for (let i = 0; i < array.size(); i++) {
                const name = array.get(i);
                if (name === PDFName.of('DCTDecode') || name === PDFName.of('FlateDecode')) {
                  isCompressible = true;
                  break;
                }
              }
            }
            
            if (isCompressible) {
              totalImages++;
            }
          }
        }
      });

      if (totalImages === 0) {
        setProgressStage('Mengoptimalkan struktur dokumen...');
        setProgress(70);
      }

      // Re-compress JPEG and FlateDecode streams
      for (let idx = 0; idx < objects.length; idx++) {
        const [ref, pdfObject] = objects[idx];
        
        if (pdfObject instanceof PDFRawStream) {
          const dict = pdfObject.dict;
          const subtype = resolveObj(dict.get(PDFName.of('Subtype')));
          if (subtype === PDFName.of('Image')) {
            const filter = resolveObj(dict.get(PDFName.of('Filter')));
            
            let isJpeg = filter === PDFName.of('DCTDecode');
            let isPng = filter === PDFName.of('FlateDecode');
            
            if (filter && typeof filter === 'object' && 'size' in filter && 'get' in filter) {
              const array = filter as any;
              for (let i = 0; i < array.size(); i++) {
                const name = array.get(i);
                if (name === PDFName.of('DCTDecode')) {
                  isJpeg = true;
                } else if (name === PDFName.of('FlateDecode')) {
                  isPng = true;
                }
              }
            }
            
            if (isJpeg || isPng) {
              processedImages++;
              setProgressStage(`Mengompresi gambar ${processedImages} dari ${totalImages}...`);
              
              try {
                const imgBytes = pdfObject.contents;
                let imgUrl = '';
                const widthObj = resolveObj(dict.get(PDFName.of('Width')));
                const heightObj = resolveObj(dict.get(PDFName.of('Height')));
                if (!widthObj || !heightObj) continue;
                let width = (widthObj as any).asNumber();
                let height = (heightObj as any).asNumber();
                
                if (isJpeg) {
                  const blob = new Blob([imgBytes as any], { type: 'image/jpeg' });
                  imgUrl = URL.createObjectURL(blob);
                } else if (isPng) {
                  // Decompress FlateDecode to raw pixel array
                  const colorSpaceObj = resolveObj(dict.get(PDFName.of('ColorSpace')));
                  const colorSpace = colorSpaceObj ? colorSpaceObj.toString() : '';
                  const bpcObj = resolveObj(dict.get(PDFName.of('BitsPerComponent')));
                  const bpc = bpcObj ? (bpcObj as any).asNumber() : 8;
                  
                  if (bpc === 8) {
                    const decompressed = await decompressZlibStream(imgBytes);
                    
                    let hasPredictor = false;
                    const decodeParms = resolveObj(dict.get(PDFName.of('DecodeParms')));
                    if (decodeParms) {
                      const predObj = resolveObj((decodeParms as any).get(PDFName.of('Predictor')));
                      if (predObj && (predObj as any).asNumber() >= 10) {
                        hasPredictor = true;
                      }
                    }
                    
                    const bytesPerPixel = (colorSpace === '/DeviceRGB' || colorSpace === '/RGB') ? 3 :
                                          (colorSpace === '/DeviceCMYK' || colorSpace === '/CMYK') ? 4 : 1;
                    const rowBytes = width * bytesPerPixel;
                    
                    let uncompressed = decompressed;
                    if (hasPredictor) {
                      uncompressed = new Uint8Array(width * height * bytesPerPixel);
                      let srcPos = 0;
                      let destPos = 0;
                      for (let y = 0; y < height; y++) {
                        const filterType = decompressed[srcPos];
                        srcPos++;
                        
                        for (let x = 0; x < rowBytes; x++) {
                          const rawByte = decompressed[srcPos + x];
                          let reconByte = rawByte;
                          
                          const left = x >= bytesPerPixel ? uncompressed[destPos + x - bytesPerPixel] : 0;
                          const up = y > 0 ? uncompressed[destPos + x - rowBytes] : 0;
                          const upLeft = (y > 0 && x >= bytesPerPixel) ? uncompressed[destPos + x - rowBytes - bytesPerPixel] : 0;
                          
                          if (filterType === 1) {
                            reconByte = (rawByte + left) & 0xff;
                          } else if (filterType === 2) {
                            reconByte = (rawByte + up) & 0xff;
                          } else if (filterType === 3) {
                            reconByte = (rawByte + Math.floor((left + up) / 2)) & 0xff;
                          } else if (filterType === 4) {
                            const p = left + up - upLeft;
                            const pa = Math.abs(p - left);
                            const pb = Math.abs(p - up);
                            const pc = Math.abs(p - upLeft);
                            let paeth = left;
                            if (pb < pa && pb < pc) paeth = up;
                            else if (pc < pa) paeth = upLeft;
                            reconByte = (rawByte + paeth) & 0xff;
                          }
                          
                          uncompressed[destPos + x] = reconByte;
                        }
                        srcPos += rowBytes;
                        destPos += rowBytes;
                      }
                    }
                    
                    // Render raw pixels to a temporary canvas
                    const rawCanvas = document.createElement('canvas');
                    rawCanvas.width = width;
                    rawCanvas.height = height;
                    const rawCtx = rawCanvas.getContext('2d');
                    if (rawCtx) {
                      const imageData = rawCtx.createImageData(width, height);
                      const data = imageData.data;
                      
                      if (bytesPerPixel === 3) { // RGB
                        for (let i = 0, j = 0; i < uncompressed.length; i += 3, j += 4) {
                          data[j] = uncompressed[i];
                          data[j+1] = uncompressed[i+1];
                          data[j+2] = uncompressed[i+2];
                          data[j+3] = 255;
                        }
                      } else if (bytesPerPixel === 1) { // Grayscale
                        for (let i = 0, j = 0; i < uncompressed.length; i++, j += 4) {
                          const val = uncompressed[i];
                          data[j] = val;
                          data[j+1] = val;
                          data[j+2] = val;
                          data[j+3] = 255;
                        }
                      } else if (bytesPerPixel === 4) { // CMYK
                        for (let i = 0, j = 0; i < uncompressed.length; i += 4, j += 4) {
                          const c = uncompressed[i] / 255;
                          const m = uncompressed[i+1] / 255;
                          const y = uncompressed[i+2] / 255;
                          const k = uncompressed[i+3] / 255;
                          data[j] = Math.round(255 * (1 - c) * (1 - k));
                          data[j+1] = Math.round(255 * (1 - m) * (1 - k));
                          data[j+2] = Math.round(255 * (1 - y) * (1 - k));
                          data[j+3] = 255;
                        }
                      }
                      
                      rawCtx.putImageData(imageData, 0, 0);
                      const rawBlob = await new Promise<Blob>((res) => 
                        rawCanvas.toBlob((b) => res(b!), 'image/jpeg', 1.0)
                      );
                      imgUrl = URL.createObjectURL(rawBlob);
                    }
                  }
                }
                
                if (imgUrl) {
                  const img = new Image();
                  img.src = imgUrl;
                  
                  await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                  });

                  const canvas = document.createElement('canvas');
                  canvas.width = Math.max(1, Math.round(img.width * scaleFactor));
                  canvas.height = Math.max(1, Math.round(img.height * scaleFactor));
                  
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Fill canvas white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const compressedBlob = await new Promise<Blob>((res) => 
                      canvas.toBlob((b) => res(b!), 'image/jpeg', qualityFactor)
                    );
                    
                    const compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());
                    
                    // Only replace if size is actually smaller
                    if (compressedBytes.length < imgBytes.length) {
                      dict.set(PDFName.of('Width'), pdfDoc.context.obj(canvas.width));
                      dict.set(PDFName.of('Height'), pdfDoc.context.obj(canvas.height));
                      dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
                      dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
                      dict.delete(PDFName.of('DecodeParms'));
                      dict.delete(PDFName.of('Decode'));

                      const newRawStream = PDFRawStream.of(dict, compressedBytes);
                      pdfDoc.context.assign(ref, newRawStream);
                    }
                  }
                  
                  URL.revokeObjectURL(imgUrl);
                }
              } catch (e) {
                console.warn('Failed to compress image object:', e);
              }

              setProgress(Math.round((processedImages / totalImages) * 70));
            }
          }
        }
      }

      setProgressStage('Menyusun dokumen terkompresi...');
      setProgress(90);
      
      const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([compressedPdfBytes as any], { type: 'application/pdf' });
      
      if (compressedPdfUrl) {
        URL.revokeObjectURL(compressedPdfUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
      setCompressedPdfSize(blob.size);
      setOriginalPdfSize(compressPdfFile.size);
      
      setProgress(100);
      setProgressStage('Selesai!');
    } catch (err) {
      console.error(err);
      setError('Gagal mengompresi PDF. File mungkin terproteksi atau tidak valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <SEO 
        title="Alat PDF - Gabung, Pisah, Kompres & Gambar ke PDF Offline" 
        description="Gunakan rangkaian alat PDF kami secara gratis dan offline. Ubah gambar ke PDF, gabungkan dokumen PDF, pisahkan halaman spesifik, atau kompres ukuran berkas PDF secara instan." 
        keywords="alat pdf, gabung pdf, pisah pdf, kompres pdf, gambar ke pdf, pdf tools offline, pdf converter, merge pdf, split pdf, kanvaskita" 
      />

      {/* Mini Hero Section */}
      <div className="relative w-full min-h-[400px] md:min-h-[450px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden py-16 flex flex-col justify-center select-none transition-colors duration-300">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/pdf tools.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-85 dark:opacity-40 select-none pointer-events-none transition-opacity duration-300"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/70 transition-colors duration-300" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(4,6,10,0.75)_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(3,1,9,0.85)_80%)] transition-colors duration-300" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950/95 dark:from-slate-950/95 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 dark:from-slate-50 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
        </div>
        
        {/* Left-Aligned Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-fade-in flex flex-col items-start text-left">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl mb-6">
            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 drop-shadow-md" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.1] drop-shadow-sm dark:drop-shadow-2xl transition-colors duration-300">
            Manajemen PDF<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 via-purple-400 to-pink-400 drop-shadow-sm">
              Super Praktis
            </span>
          </h1>
          
          <p className="mt-2 text-base sm:text-lg text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm transition-colors duration-300">
            Gunakan rangkaian alat PDF kami secara gratis dan offline. Ubah gambar ke PDF, gabungkan, pisahkan, atau kompres dokumen secara instan tanpa upload ke server.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">

      {/* Tab Menu Utama */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
        {[
          { id: 'images-to-pdf', label: 'Gambar ke PDF' },
          { id: 'merge-pdf', label: 'Gabung PDF' },
          { id: 'split-pdf', label: 'Pisah PDF' },
          { id: 'compress-pdf', label: 'Kompres PDF' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => !isProcessing && setActiveTab(tab.id as PDFTab)}
            className={`py-3 px-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:text-slate-950 dark:hover:text-slate-200'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Konten Utama Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Formulir / Aksi */}
        <div className="lg:col-span-8">
          
          {/* TAB 1: GAMBAR KE PDF */}
          {activeTab === 'images-to-pdf' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              {convertedPdfUrl ? (
                /* PDF Preview Section */
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Hasil Konversi PDF</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        PDF berhasil dibuat dari {imagesList.length} gambar.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                      {formatSize(convertedPdfSize)}
                    </span>
                  </div>
                  
                  {/* PDF Preview Iframe */}
                  <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner flex items-center justify-center">
                    <iframe
                      src={`${convertedPdfUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-none"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              ) : (
                /* Upload & Queue Section */
                <>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Unggah Gambar</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unggah beberapa file JPG/PNG untuk digabungkan menjadi PDF.</p>
                  </div>

                  {/* Upload Dropzone */}
                  <div 
                    onDragEnter={handleDragImages}
                    onDragLeave={handleDragImages}
                    onDragOver={handleDragImages}
                    onDrop={handleDropImages}
                    onClick={() => imagesInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
                      dragActiveImages 
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 scale-[0.985] shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5'
                    }`}
                  >
                    <input 
                      ref={imagesInputRef}
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => handleImagesUpload(e.target.files)}
                      className="hidden"
                    />
                    
                    {/* Glowing ambient light */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="w-16 h-16 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    </div>

                    <span className="text-xs font-black text-slate-850 dark:text-white block tracking-tight">Seret & Letakkan File Gambar</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Atau klik untuk memilih berkas PNG/JPG secara lokal</span>
                  </div>

                  {/* Daftar Antrian Gambar */}
                  {imagesList.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Urutan Halaman Gambar ({imagesList.length})</span>
                        <button 
                          onClick={() => setImagesList([])}
                          className="text-[10px] font-bold text-rose-600 hover:underline"
                        >
                          Hapus Semua
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {imagesList.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                              <FileImage className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px] md:max-w-[300px]">{file.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium">{formatSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => moveImage(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 disabled:opacity-30"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button 
                                onClick={() => moveImage(idx, 'down')}
                                disabled={idx === imagesList.length - 1}
                                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 disabled:opacity-30"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button 
                                onClick={() => removeImage(idx)}
                                className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: GABUNG PDF */}
          {activeTab === 'merge-pdf' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Unggah File PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unggah dua atau lebih file PDF untuk digabungkan secara berurutan.</p>
              </div>

              {/* Upload Dropzone */}
              <div 
                onDragEnter={handleDragPdfs}
                onDragLeave={handleDragPdfs}
                onDragOver={handleDragPdfs}
                onDrop={handleDropPdfs}
                onClick={() => pdfInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
                  dragActivePdfs 
                    ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 scale-[0.985] shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5'
                }`}
              >
                <input 
                  ref={pdfInputRef}
                  type="file" 
                  multiple 
                  accept=".pdf"
                  onChange={(e) => handlePdfsUpload(e.target.files)}
                  className="hidden"
                />
                
                {/* Glowing ambient light */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>

                <span className="text-xs font-black text-slate-850 dark:text-white block tracking-tight">Seret & Letakkan File PDF</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Atau klik untuk memilih berkas PDF secara lokal</span>
              </div>

              {/* Daftar Antrian PDF */}
              {pdfFiles.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Urutan Penggabungan Berkas ({pdfFiles.length})</span>
                    <button 
                      onClick={() => setPdfFiles([])}
                      className="text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {pdfFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                          <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px] md:max-w-[300px]">{file.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{formatSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => movePdf(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button 
                            onClick={() => movePdf(idx, 'down')}
                            disabled={idx === pdfFiles.length - 1}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button 
                            onClick={() => removePdf(idx)}
                            className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PISAH PDF */}
          {activeTab === 'split-pdf' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Unggah Berkas PDF Asli</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih berkas PDF yang ingin Anda ekstrak halamannya.</p>
              </div>

              {!singlePdfFile ? (
                <div 
                  onDragEnter={handleDragSplit}
                  onDragLeave={handleDragSplit}
                  onDragOver={handleDragSplit}
                  onDrop={handleDropSplit}
                  onClick={() => splitInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
                    dragActiveSplit 
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 scale-[0.985] shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5'
                  }`}
                >
                  <input 
                    ref={splitInputRef}
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => handleSplitUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  {/* Glowing ambient light */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="w-16 h-16 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>

                  <span className="text-xs font-black text-slate-850 dark:text-white block tracking-tight">Pilih Berkas PDF Utama</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Seret & letakkan berkas PDF di sini secara lokal</span>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-[400px]">{singlePdfFile.name}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {formatSize(singlePdfInfo?.size || 0)} • {singlePdfInfo?.pages} Halaman
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSinglePdfFile(null); setSinglePdfInfo(null); }}
                      className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-350"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Pengaturan Pemotongan Halaman */}
                  <div className="flex flex-col gap-2 p-5 bg-slate-50/40 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-850 rounded-2xl">
                    <label className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Tentukan Halaman yang Diekstrak</label>
                    <input 
                      type="text"
                      placeholder="Contoh: 1-3, 5 (halaman 1 sampai 3, ditambah halaman 5)"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      Format didukung: rentang menggunakan tanda strip (misal `2-4`) dan halaman terpisah dipisah koma (misal `1,3,5`).
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: KOMPRES PDF */}
          {activeTab === 'compress-pdf' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              {compressedPdfUrl ? (
                /* Compression Results Section */
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Hasil Kompresi PDF</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ukuran dokumen PDF Anda berhasil dioptimalkan.
                      </p>
                    </div>
                  </div>

                  {/* Size Comparison Cards */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Awal</span>
                      <span className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white">{formatSize(originalPdfSize)}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ukuran Hasil</span>
                      <span className="text-xs md:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{formatSize(compressedPdfSize)}</span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${
                      pdfSavings.percent > 0 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Penghematan</span>
                      <span className="text-xs md:text-sm font-extrabold block truncate">
                        {pdfSavings.percent > 0 ? `${pdfSavings.percent}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* PDF Preview Iframe */}
                  <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner flex items-center justify-center">
                    <iframe
                      src={`${compressedPdfUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-none"
                      title="Compressed PDF Preview"
                    />
                  </div>
                </div>
              ) : (
                /* Original Upload Queue */
                <>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">1. Unggah PDF Besar</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Optimalkan ukuran file PDF dengan mengompres gambar internalnya.</p>
                  </div>

                  {!compressPdfFile ? (
                    <div 
                      onDragEnter={handleDragCompress}
                      onDragLeave={handleDragCompress}
                      onDragOver={handleDragCompress}
                      onDrop={handleDropCompress}
                      onClick={() => compressInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-md bg-white/40 dark:bg-slate-900/40 ${
                        dragActiveCompress 
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/5 scale-[0.985] shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5'
                      }`}
                    >
                      <input 
                        ref={compressInputRef}
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => handleCompressUpload(e.target.files)}
                        className="hidden"
                      />
                      
                      {/* Glowing ambient light */}
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="w-16 h-16 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      </div>

                      <span className="text-xs font-black text-slate-850 dark:text-white block tracking-tight">Pilih Berkas PDF untuk Dikompres</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">Seret & letakkan berkas PDF di sini secara lokal</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-[400px]">{compressPdfFile.name}</p>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">{formatSize(compressPdfFile.size)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCompressPdfFile(null)}
                          className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-350"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Level Kompresi */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Pilih Tingkat Kompresi</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'high', label: 'Kompresi Rendah', desc: 'Kualitas Tinggi' },
                            { id: 'medium', label: 'Kompresi Sedang', desc: 'Seimbang' },
                            { id: 'low', label: 'Kompresi Tinggi', desc: 'Ukuran Minimal' }
                          ].map((level) => (
                            <button
                              key={level.id}
                              onClick={() => setCompressLevel(level.id)}
                              className={`py-3 px-2 rounded-xl border text-center transition-all ${
                                compressLevel === level.id 
                                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold' 
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span className="text-xs block">{level.label}</span>
                              <span className="text-[9px] opacity-60 block mt-0.5 font-medium">{level.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>

        {/* Kolom Kanan: Panel Kontrol Ringkasan & Hasil Aksi */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Card Statistik Progres & Konfirmasi Aksi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Konfirmasi Proses
            </h3>

            {/* Area Pengaturan Layout/Margin (Spesifik Tab 1) */}
            {activeTab === 'images-to-pdf' && imagesList.length > 0 && (
              <div className="flex flex-col gap-4 text-xs font-semibold">
                {/* Kertas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 dark:text-slate-400">Ukuran Halaman</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                  >
                    <option value="a4">Kertas A4</option>
                    <option value="letter">Kertas Letter</option>
                    <option value="fit">Ikuti Ukuran Gambar (Fit)</option>
                  </select>
                </div>

                {/* Orientasi */}
                {pageSize !== 'fit' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-500 dark:text-slate-400">Orientasi Halaman</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPageOrientation('portrait')}
                        className={`py-1.5 px-3 border rounded-lg ${pageOrientation === 'portrait' ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        Potret
                      </button>
                      <button
                        onClick={() => setPageOrientation('landscape')}
                        className={`py-1.5 px-3 border rounded-lg ${pageOrientation === 'landscape' ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        Lanskap
                      </button>
                    </div>
                  </div>
                )}

                {/* Margin */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-500 dark:text-slate-400">Margin Halaman</label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none"
                  >
                    <option value="0">Tanpa Margin (0px)</option>
                    <option value="15">Margin Tipis (15px)</option>
                    <option value="30">Margin Tebal (30px)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Informasi Umum Tab */}
            {activeTab === 'merge-pdf' && pdfFiles.length < 2 && (
              <span className="text-xs text-slate-400 font-semibold leading-relaxed">
                *Tambahkan minimal 2 berkas PDF di kolom kiri untuk mengaktifkan tombol gabung.
              </span>
            )}

            {activeTab === 'split-pdf' && !singlePdfFile && (
              <span className="text-xs text-slate-400 font-semibold leading-relaxed">
                *Pilih file PDF terlebih dahulu untuk mengaktifkan setelan pemisahan halaman.
              </span>
            )}

            {activeTab === 'compress-pdf' && !compressPdfFile && (
              <span className="text-xs text-slate-400 font-semibold leading-relaxed">
                *Pilih file PDF terlebih dahulu untuk mengaktifkan menu kompresi.
              </span>
            )}

            {/* Status Pemrosesan */}
            {isProcessing && (
              <div className="flex flex-col gap-2 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  <span className="truncate max-w-[150px]">{progressStage || 'Memproses...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-400 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold leading-normal">
                {error}
              </div>
            )}

            {/* Tombol Aksi Final */}
            <div className="flex flex-col gap-2 mt-auto">
              {activeTab === 'images-to-pdf' && (
                convertedPdfUrl ? (
                  <div className="flex flex-col gap-2">
                    <a
                      href={convertedPdfUrl}
                      download={convertedPdfName || 'compiled_images_kanvaskita.pdf'}
                      className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer animate-fade-in"
                    >
                      <Download size={14} />
                      Unduh PDF Hasil Konversi
                    </a>
                    <button
                      onClick={handleResetImagesToPdf}
                      className="w-full py-2.5 px-4 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Mulai Baru / Bersihkan
                    </button>
                    
                    <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                      <span className="text-[10px] text-slate-400 block mb-2 font-semibold uppercase tracking-wider">Sesuaikan Setelan</span>
                      <button
                        disabled={isProcessing}
                        onClick={handleImagesToPdf}
                        className="w-full py-2 px-3 font-semibold text-xs rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw size={12} className={isProcessing ? 'animate-spin' : ''} />
                        Terapkan Setelan Baru
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    disabled={imagesList.length === 0 || isProcessing}
                    onClick={handleImagesToPdf}
                    className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                    Konversi Gambar ke PDF
                  </button>
                )
              )}

              {activeTab === 'merge-pdf' && (
                <button
                  disabled={pdfFiles.length < 2 || isProcessing}
                  onClick={handleMergePdfs}
                  className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  Gabungkan File PDF
                </button>
              )}

              {activeTab === 'split-pdf' && (
                <button
                  disabled={!singlePdfFile || isProcessing}
                  onClick={handleSplitPdf}
                  className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  Pisahkan Halaman PDF
                </button>
              )}

              {activeTab === 'compress-pdf' && (
                compressedPdfUrl ? (
                  <div className="flex flex-col gap-2">
                    <a
                      href={compressedPdfUrl}
                      download={`compressed_${compressPdfFile?.name}`}
                      className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer animate-fade-in"
                    >
                      <Download size={14} />
                      Unduh PDF Terkompresi
                    </a>
                    <button
                      onClick={handleResetCompressPdf}
                      className="w-full py-2.5 px-4 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Kompres File Lain
                    </button>
                  </div>
                ) : (
                  <button
                    disabled={!compressPdfFile || isProcessing}
                    onClick={handleCompressPdf}
                    className="w-full py-3 px-4 font-bold text-xs md:text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-900 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                    Kompres Ukuran PDF
                  </button>
                )
              )}
            </div>
          </div>

          {/* Banner Privasi */}
          <div className="flex gap-2.5 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
            <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Aman & Privat</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Semua dokumen diproses secara penuh di browser Anda. Tidak ada file yang dikirim ke server luar.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 text-xs shadow-sm">
            <Zap size={20} className="text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Pemrosesan Kilat</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Menggunakan `pdf-lib` berkinerja tinggi untuk memberikan hasil ekspor instan di bawah 1 detik.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
    </div>
  );
};
