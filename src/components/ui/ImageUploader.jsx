import { useState, useRef, useEffect } from 'react'
import { Upload, X, Star, Check } from 'lucide-react'

const ImageUploader = ({ 
  images = [], 
  onChange, 
  mainImage = '', 
  onMainImageChange,
  maxSize = 5, 
  acceptedTypes = 'image/*', 
  multiple = false 
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef()

  // If no main image is set but we have images, auto-set the first one as main
  useEffect(() => {
    if (images.length > 0 && !mainImage && onMainImageChange) {
      onMainImageChange(images[0])
    }
  }, [images, mainImage, onMainImageChange])

  const validateFile = (file) => {
    const fileErrors = []
    if (!file.type.startsWith('image/')) {
      fileErrors.push(`${file.name}: Must be an image file`)
    }
    if (file.size > maxSize * 1024 * 1024) {
      fileErrors.push(`${file.name}: Size must be less than ${maxSize}MB`)
    }
    return fileErrors
  }

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    const newErrors = []
    const newPreviews = []
    
    let processed = 0
    fileArray.forEach(file => {
      const fileErrors = validateFile(file)
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors)
        processed++
        if (processed === fileArray.length && newErrors.length > 0) {
          setErrors(newErrors)
          setTimeout(() => setErrors([]), 5000)
        }
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target.result)
          processed++
          if (processed === fileArray.length) {
            const updatedImages = multiple ? [...images, ...newPreviews] : [newPreviews[0]]
            if (onChange) {
              onChange(updatedImages)
            }
            if (newPreviews.length > 0 && (!mainImage || !multiple) && onMainImageChange) {
              onMainImageChange(newPreviews[0])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (index, e) => {
    e.stopPropagation()
    const targetImage = images[index]
    const updatedImages = images.filter((_, i) => i !== index)
    
    if (onChange) {
      onChange(updatedImages)
    }

    // If removed image was the main image, pick another one
    if (targetImage === mainImage && onMainImageChange) {
      onMainImageChange(updatedImages.length > 0 ? updatedImages[0] : '')
    }
  }

  const selectMainImage = (url, e) => {
    e.stopPropagation()
    if (onMainImageChange) {
      onMainImageChange(url)
    }
  }

  const openFileDialog = (e) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
          ))}
        </div>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${isDragging
          ? 'border-deep-olive bg-deep-olive/5'
          : 'border-border/60 hover:border-deep-olive/30 hover:bg-gray-50/50 dark:hover:bg-white/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {images.length === 0 ? (
          <div className="py-4">
            <div className="w-12 h-12 bg-gray-100/50 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-text" />
            </div>
            <h4 className="text-sm font-semibold text-text-h mb-1">
              Drag and drop image here
            </h4>
            <p className="text-xs text-text mb-4">
              or click to browse your files (PNG, JPG, max {maxSize}MB)
            </p>
            <button
              onClick={openFileDialog}
              className="px-4 py-2 bg-deep-olive text-white rounded-xl hover:bg-deep-olive/90 transition-colors text-xs font-semibold"
            >
              Choose file
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((url, index) => {
                const isMain = url === mainImage
                return (
                  <div 
                    key={index} 
                    className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isMain ? 'border-deep-olive shadow-md' : 'border-border/40 hover:border-border-strong'
                    }`}
                    onClick={(e) => selectMainImage(url, e)}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover"
                    />
                    
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={(e) => selectMainImage(url, e)}
                          className="p-1.5 bg-white/95 text-deep-olive rounded-lg hover:scale-105 transition-transform"
                          title="Set as main image"
                        >
                          <Star className="w-4 h-4 fill-deep-olive" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => removeImage(index, e)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:scale-105 transition-transform"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Main Image Badge */}
                    {isMain && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-deep-olive text-white text-[9px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                        <Check className="w-2.5 h-2.5" /> Main
                      </span>
                    )}

                    {/* Quick remove button when not hovering (mobile friendly) */}
                    <button
                      type="button"
                      onClick={(e) => removeImage(index, e)}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full sm:hidden"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="flex items-center justify-center gap-3">
              {multiple && (
                <button
                  onClick={openFileDialog}
                  className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 text-text hover:bg-gray-200/50 dark:hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold"
                >
                  Add more files
                </button>
              )}
              {!multiple && images.length > 0 && (
                <button
                  onClick={openFileDialog}
                  className="px-4 py-2 bg-gray-100/50 dark:bg-white/5 text-text hover:bg-gray-200/50 dark:hover:bg-white/10 rounded-xl transition-colors text-xs font-semibold"
                >
                  Replace image
                </button>
              )}
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={(e) => e.target.files?.length > 0 && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ImageUploader