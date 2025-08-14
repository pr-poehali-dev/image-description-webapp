import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  size: string;
  preview?: string;
}

interface AnalysisResult {
  filename: string;
  title: string;
  description?: string;
  keywords: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [useFilename, setUseFilename] = useState(false);
  const [includeDescription, setIncludeDescription] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');

  const onDrop = useCallback((acceptedFiles: FileList) => {
    const newImages: ImageFile[] = Array.from(acceptedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(e.target.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearImages = () => {
    setImages([]);
    setResults([]);
  };

  const analyzeImages = async () => {
    if (!apiKey.trim()) {
      alert('Пожалуйста, введите API ключ');
      return;
    }
    
    if (images.length === 0) {
      alert('Пожалуйста, загрузите изображения');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      setProgress((i / images.length) * 100);
      
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result: AnalysisResult = {
        filename: image.name,
        title: `SEO заголовок для ${image.name}`,
        description: includeDescription ? `Детальное описание изображения ${image.name}` : undefined,
        keywords: 'ключевое слово1, ключевое слово2, ключевое слово3',
        status: 'completed'
      };
      
      newResults.push(result);
    }

    setResults(newResults);
    setProgress(100);
    setIsProcessing(false);
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const headers = includeDescription 
      ? ['filename', 'title', 'descriptors', 'keywords']
      : ['filename', 'title', 'keywords'];
    
    const csvContent = [
      headers.join(','),
      ...results.map(row => {
        const values = includeDescription
          ? [row.filename, row.title, row.description || '', row.keywords]
          : [row.filename, row.title, row.keywords];
        return values.map(val => `"${val}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image_analysis_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveToGoogleSheets = () => {
    if (!googleSheetsUrl.trim()) {
      alert('Пожалуйста, введите URL Google Таблицы');
      return;
    }
    alert('Функция сохранения в Google Таблицы будет реализована в следующей версии');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IMAGE ANALYZER</h1>
          <p className="text-lg text-gray-600">AI-анализ изображений для SEO оптимизации</p>
        </div>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Настройки API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Ключ</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Введите ваш OpenAI API ключ"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Модель</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-5">GPT-5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useFilename" 
                  checked={useFilename}
                  onCheckedChange={setUseFilename}
                />
                <Label htmlFor="useFilename">Использовать имя файла для контекста</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeDescription" 
                  checked={includeDescription}
                  onCheckedChange={setIncludeDescription}
                />
                <Label htmlFor="includeDescription">Добавить поле описания</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} />
              Загрузка изображений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Icon name="ImagePlus" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Перетащите изображения сюда</p>
              <p className="text-gray-500 mb-4">или нажмите для выбора файлов</p>
              <input
                type="file"
                multiple
                accept="image/*,.svg"
                onChange={handleFileInput}
                className="hidden"
                id="fileInput"
              />
              <Button asChild>
                <label htmlFor="fileInput" className="cursor-pointer">
                  Выбрать файлы
                </label>
              </Button>
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Загруженные изображения ({images.length})</h3>
                  <Button variant="outline" size="sm" onClick={clearImages}>
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map(image => (
                    <div key={image.id} className="border rounded-lg p-3 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{image.name}</p>
                          <p className="text-xs text-gray-500">{image.size}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeImage(image.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                      {image.preview && (
                        <img 
                          src={image.preview} 
                          alt={image.name}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={analyzeImages}
                disabled={isProcessing || images.length === 0 || !apiKey}
                className="flex-1"
              >
                <Icon name="Zap" size={16} className="mr-2" />
                {isProcessing ? 'Анализируем...' : 'Начать анализ'}
              </Button>
              
              {results.length > 0 && (
                <>
                  <Button onClick={exportToCSV} variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт CSV
                  </Button>
                  <Button onClick={saveToGoogleSheets} variant="outline">
                    <Icon name="Table" size={16} className="mr-2" />
                    В Google Таблицы
                  </Button>
                </>
              )}
            </div>

            {isProcessing && (
              <div className="mt-4">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-gray-600 text-center">{Math.round(progress)}% завершено</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Sheets URL */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Link" size={20} />
                Google Таблицы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="googleSheetsUrl">URL Google Таблицы</Label>
                <Textarea
                  id="googleSheetsUrl"
                  placeholder="Вставьте ссылку на Google Таблицу"
                  value={googleSheetsUrl}
                  onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Table" size={20} />
                Результаты анализа
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Файл</TableHead>
                      <TableHead>SEO Заголовок</TableHead>
                      {includeDescription && <TableHead>Описание</TableHead>}
                      <TableHead>Ключевые слова</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{result.filename}</TableCell>
                        <TableCell>{result.title}</TableCell>
                        {includeDescription && <TableCell>{result.description}</TableCell>}
                        <TableCell>{result.keywords}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Готово
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;