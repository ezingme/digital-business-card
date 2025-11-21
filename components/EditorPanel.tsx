import React, { useState, useEffect, useRef } from 'react';
import { CardData, TemplateType, CardSection, ServiceItem, SocialLink } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AVAILABLE_COLORS } from '../constants';
import { generateBio, generateServices } from '../services/geminiService';
import { 
    GripVertical, Wand2, Eye, EyeOff, LayoutTemplate, User, Palette, List, 
    Pencil, ChevronLeft, Plus, Trash2, Check, Bold, Italic, Underline, 
    AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Video,
    Heading1, Heading2
} from 'lucide-react';

// --- Utility Components ---

const ToolbarBtn = ({ icon, onClick, active = false, title }: { icon: React.ReactNode, onClick: () => void, active?: boolean, title?: string }) => (
    <button 
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${active ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title={title}
    >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
    </button>
);

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only update if the content is significantly different to avoid cursor jumping
            // This is a simple check; for production, a better diff comparison is needed
            if (Math.abs(editorRef.current.innerHTML.length - value.length) > 5 || value === '') {
                 editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]); 

    const handleCommand = (command: string, val: string | undefined = undefined) => {
        document.execCommand(command, false, val);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleImage = () => {
        const url = window.prompt("Enter Image URL:");
        if (url) {
            handleCommand('insertImage', url);
        }
    };

    const handleVideo = () => {
        const url = window.prompt("Enter YouTube Video URL:");
        if (url) {
             let embedUrl = url;
             // Simple parser for YouTube URLs
             const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
             if (ytMatch && ytMatch[1]) {
                 const vid = ytMatch[1].split('&')[0];
                 embedUrl = `https://www.youtube.com/embed/${vid}`;
             }
             
             const html = `<div class="aspect-w-16 aspect-h-9 my-4"><iframe src="${embedUrl}" class="w-full h-full rounded-lg shadow-sm" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
             handleCommand('insertHTML', html);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleCommand('foreColor', e.target.value);
    };

    return (
        <div className="border rounded-lg overflow-hidden border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow bg-white">
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 flex-wrap items-center">
                {/* Basic Formatting */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={<Bold/>} onClick={() => handleCommand('bold')} title="Bold" />
                    <ToolbarBtn icon={<Italic/>} onClick={() => handleCommand('italic')} title="Italic" />
                    <ToolbarBtn icon={<Underline/>} onClick={() => handleCommand('underline')} title="Underline" />
                </div>
                
                <div className="w-px h-5 bg-slate-300 mx-1" />
                
                {/* Headings & Lists */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={<Heading1/>} onClick={() => handleCommand('formatBlock', 'H1')} title="Header 1" />
                    <ToolbarBtn icon={<Heading2/>} onClick={() => handleCommand('formatBlock', 'H2')} title="Header 2" />
                    <ToolbarBtn icon={<List/>} onClick={() => handleCommand('insertUnorderedList')} title="Bullet List" />
                </div>

                <div className="w-px h-5 bg-slate-300 mx-1" />
                
                {/* Alignment */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={<AlignLeft/>} onClick={() => handleCommand('justifyLeft')} title="Align Left" />
                    <ToolbarBtn icon={<AlignCenter/>} onClick={() => handleCommand('justifyCenter')} title="Align Center" />
                    <ToolbarBtn icon={<AlignRight/>} onClick={() => handleCommand('justifyRight')} title="Align Right" />
                </div>

                <div className="w-px h-5 bg-slate-300 mx-1" />

                {/* Size & Color */}
                <div className="flex gap-1 items-center">
                    <button 
                        onClick={(e) => { e.preventDefault(); handleCommand('fontSize', '3'); }} 
                        className="w-6 h-6 text-xs font-serif bg-white border border-slate-200 rounded hover:bg-slate-100 flex items-center justify-center"
                        title="Normal Text"
                    >
                        A
                    </button>
                     <button 
                        onClick={(e) => { e.preventDefault(); handleCommand('fontSize', '5'); }} 
                        className="w-6 h-6 text-sm font-serif font-bold bg-white border border-slate-200 rounded hover:bg-slate-100 flex items-center justify-center"
                        title="Large Text"
                    >
                        A+
                    </button>
                    <div className="relative w-6 h-6 ml-1 cursor-pointer group">
                        <Palette size={16} className="text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <input 
                            type="color" 
                            className="opacity-0 w-full h-full cursor-pointer absolute inset-0"
                            onChange={handleColorChange}
                            title="Text Color"
                        />
                    </div>
                </div>

                <div className="w-px h-5 bg-slate-300 mx-1" />

                {/* Media */}
                <div className="flex gap-0.5">
                    <ToolbarBtn icon={<ImageIcon/>} onClick={handleImage} title="Insert Image URL" />
                    <ToolbarBtn icon={<Video/>} onClick={handleVideo} title="Insert Video URL" />
                </div>
            </div>
            <div 
                ref={editorRef}
                className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none text-slate-700 [&>div.aspect-w-16]:my-4 [&>img]:rounded-lg [&>img]:max-w-full [&>img]:h-auto"
                contentEditable
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                onBlur={(e) => onChange(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
};

// --- Sortable Items ---

const SortableSectionItem = ({ id, section, onToggle, onEdit, onDelete }: { id: string, section: CardSection, onToggle: (id: string) => void, onEdit: (id: string) => void, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg mb-2 shadow-sm hover:border-indigo-300 transition-colors group"
    >
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 touch-none">
          <GripVertical size={18} />
        </button>
        <div className="flex flex-col truncate">
            <span className="font-medium text-slate-700 truncate text-sm">{section.title}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{section.type}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(id)} className="p-2 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit Content">
            <Pencil size={16} />
        </button>
        <button onClick={() => onToggle(id)} className={`p-2 rounded transition-colors ${section.isVisible ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`} title="Toggle Visibility">
            {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        {!['contact', 'social', 'about'].includes(section.type) && (
             <button onClick={() => onDelete(id)} className="p-2 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Section">
                <Trash2 size={16} />
             </button>
        )}
      </div>
    </div>
  );
};

const SortableServiceItem = ({ id, item, index, onUpdate, onDelete }: { id: string, item: ServiceItem, index: number, onUpdate: (idx: number, val: ServiceItem) => void, onDelete: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="p-3 bg-white rounded border border-slate-200 relative group mb-2 shadow-sm">
             <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none" {...attributes} {...listeners}>
                <GripVertical size={16} />
             </div>
             <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
             </button>
             <div className="pl-6">
                 <input 
                     type="text" 
                     value={item.title}
                     onChange={(e) => onUpdate(index, { ...item, title: e.target.value })}
                     className="block w-[90%] bg-transparent border-none p-0 text-sm font-medium placeholder-slate-400 focus:ring-0 mb-1"
                     placeholder="Service Title"
                 />
                 <input 
                     type="text" 
                     value={item.desc}
                     onChange={(e) => onUpdate(index, { ...item, desc: e.target.value })}
                     className="block w-full bg-transparent border-none p-0 text-xs text-slate-500 placeholder-slate-300 focus:ring-0"
                     placeholder="Short description..."
                 />
             </div>
        </div>
    )
}

const SortableSocialItem = ({ id, link, index, onUpdate, onDelete }: { id: string, link: SocialLink, index: number, onUpdate: (idx: number, val: SocialLink) => void, onDelete: (id: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center mb-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>
            <select 
                value={link.platform}
                onChange={(e) => onUpdate(index, { ...link, platform: e.target.value as any })}
                className="w-28 p-2 border border-slate-200 rounded text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="github">GitHub</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="globe">Website</option>
            </select>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    value={link.url}
                    onChange={(e) => onUpdate(index, { ...link, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
                />
                <button 
                    onClick={() => onDelete(link.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    )
}

// --- Main Editor Component ---
interface EditorPanelProps {
  data: CardData;
  onChange: (data: CardData) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'design' | 'sections'>('details');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.sections.findIndex((s) => s.id === active.id);
      const newIndex = data.sections.findIndex((s) => s.id === over.id);
      onChange({ ...data, sections: arrayMove(data.sections, oldIndex, newIndex) });
    }
  };

  const handleServiceDragEnd = (event: DragEndEvent, sectionId: string) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sectionIndex = data.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return;

      const section = data.sections[sectionIndex];
      if (!section.items) return;

      const oldIndex = section.items.findIndex(i => i.id === active.id);
      const newIndex = section.items.findIndex(i => i.id === over.id);
      
      const newItems = arrayMove(section.items, oldIndex, newIndex);
      
      const newSections = [...data.sections];
      newSections[sectionIndex] = { ...section, items: newItems };
      onChange({ ...data, sections: newSections });
  };

  const handleSocialDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = data.socialLinks.findIndex(s => s.id === active.id);
      const newIndex = data.socialLinks.findIndex(s => s.id === over.id);
      onChange({ ...data, socialLinks: arrayMove(data.socialLinks, oldIndex, newIndex) });
  };

  const handleInfoChange = (field: keyof typeof data.personalInfo, value: string) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const toggleSection = (id: string) => {
    const updatedSections = data.sections.map(s => 
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    );
    onChange({ ...data, sections: updatedSections });
  };

  const deleteSection = (id: string) => {
      if(confirm('Are you sure you want to delete this section?')) {
          onChange({ ...data, sections: data.sections.filter(s => s.id !== id) });
      }
  }

  const addSection = (type: CardSection['type']) => {
      const newSection: CardSection = {
          id: crypto.randomUUID(),
          type,
          title: type === 'rich-text' ? 'New Content' : type === 'services' ? 'My Services' : 'Section',
          isVisible: true,
          content: type === 'rich-text' ? '<p>Start typing...</p>' : '',
          items: type === 'services' ? [{ id: crypto.randomUUID(), title: 'Service 1', desc: 'Description' }] : undefined
      };
      onChange({ ...data, sections: [...data.sections, newSection] });
      setShowAddSection(false);
      setEditingSectionId(newSection.id);
  };

  const updateSection = (id: string, updates: Partial<CardSection>) => {
     const updatedSections = data.sections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    onChange({ ...data, sections: updatedSections });
  };

  // --- AI Generators ---
  const handleBioGeneration = async () => {
    setIsGenerating(true);
    const bio = await generateBio(
      data.personalInfo.fullName,
      data.personalInfo.title,
      data.personalInfo.company,
      'professional'
    );
    
    const updatedSections = data.sections.map(s => 
      s.type === 'about' ? { ...s, content: bio } : s
    );
    
    onChange({ ...data, sections: updatedSections });
    setIsGenerating(false);
  };

  const handleServiceGeneration = async () => {
      setIsGenerating(true);
      const newServices = await generateServices(data.personalInfo.title, data.personalInfo.company);
      
      if (newServices.length > 0) {
          const servicesWithIds = newServices.map(s => ({ ...s, id: crypto.randomUUID() }));
          const updatedSections = data.sections.map(s => 
              s.type === 'services' ? { ...s, items: [...(s.items || []), ...servicesWithIds] } : s
          );
          onChange({ ...data, sections: updatedSections });
      }
      setIsGenerating(false);
  };

  // --- Section Specific Editors ---
  const renderSectionEditor = () => {
      const section = data.sections.find(s => s.id === editingSectionId);
      if (!section) return null;

      return (
          <div className="animate-in slide-in-from-right duration-200 h-full flex flex-col">
              <button 
                onClick={() => setEditingSectionId(null)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4 group"
              >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sections
              </button>
              
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-800 mb-1">{section.title}</h2>
                 <p className="text-xs text-slate-500">Edit the content for this section.</p>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pb-20">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Title</label>
                     <input 
                        type="text" 
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                  </div>

                  {section.type === 'about' && (
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                         <div className="flex justify-between items-center mb-2">
                           <label className="block text-xs font-bold text-indigo-800 uppercase">Content</label>
                           <button 
                              onClick={handleBioGeneration}
                              disabled={isGenerating}
                              className="text-xs flex items-center gap-1 bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                           >
                             <Wand2 size={12} /> {isGenerating ? 'Writing...' : 'Auto-Write'}
                           </button>
                         </div>
                         <textarea 
                            rows={6}
                            className="w-full p-2 border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            value={section.content || ''}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            placeholder="Tell people about yourself..."
                         />
                      </div>
                  )}

                  {section.type === 'rich-text' && (
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rich Text Content</label>
                          <RichTextEditor 
                              value={section.content || ''}
                              onChange={(val) => updateSection(section.id, { content: val })}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Supports images, videos, and basic HTML formatting.</p>
                      </div>
                  )}

                  {section.type === 'services' && (
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                             <label className="block text-xs font-bold text-slate-500 uppercase">Service Items</label>
                             <button 
                                onClick={handleServiceGeneration}
                                disabled={isGenerating}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                             >
                                <Wand2 size={12} /> {isGenerating ? 'Thinking...' : 'Suggest with AI'}
                             </button>
                         </div>
                         
                         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleServiceDragEnd(e, section.id)}>
                            <SortableContext items={section.items || []} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {section.items?.map((item, idx) => (
                                        <SortableServiceItem 
                                            key={item.id} 
                                            id={item.id} 
                                            item={item} 
                                            index={idx} 
                                            onUpdate={(idx, val) => {
                                                const newItems = [...(section.items || [])];
                                                newItems[idx] = val;
                                                updateSection(section.id, { items: newItems });
                                            }}
                                            onDelete={(id) => {
                                                 const newItems = section.items?.filter(i => i.id !== id);
                                                 updateSection(section.id, { items: newItems });
                                            }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                         </DndContext>

                         <button 
                            onClick={() => {
                                const newItem: ServiceItem = { id: crypto.randomUUID(), title: '', desc: '' };
                                updateSection(section.id, { items: [...(section.items || []), newItem] });
                            }}
                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                         >
                             <Plus size={16} /> Add Service
                         </button>
                      </div>
                  )}

                  {section.type === 'social' && (
                      <div className="space-y-4">
                         <div className="space-y-3">
                             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSocialDragEnd}>
                                <SortableContext items={data.socialLinks} strategy={verticalListSortingStrategy}>
                                    {data.socialLinks.map((link, idx) => (
                                        <SortableSocialItem 
                                            key={link.id}
                                            id={link.id}
                                            link={link}
                                            index={idx}
                                            onUpdate={(idx, val) => {
                                                const newLinks = [...data.socialLinks];
                                                newLinks[idx] = val;
                                                onChange({ ...data, socialLinks: newLinks });
                                            }}
                                            onDelete={(id) => {
                                                  const newLinks = data.socialLinks.filter(l => l.id !== id);
                                                  onChange({ ...data, socialLinks: newLinks });
                                            }}
                                        />
                                    ))}
                                </SortableContext>
                             </DndContext>
                         </div>
                         <button 
                            onClick={() => {
                                const newLink: SocialLink = { id: crypto.randomUUID(), platform: 'linkedin', url: '' };
                                onChange({ ...data, socialLinks: [...data.socialLinks, newLink] });
                            }}
                            className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                         >
                             <Plus size={16} /> Add Social Profile
                         </button>
                      </div>
                  )}

                  {section.type === 'contact' && (
                      <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                          Contact details are managed in the <strong>Details</strong> tab. This section controls where the contact block appears on your card.
                      </div>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 flex-shrink-0">
        <button 
          onClick={() => { setActiveTab('details'); setEditingSectionId(null); }}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <User size={16} /> Details
        </button>
        <button 
          onClick={() => { setActiveTab('sections'); setEditingSectionId(null); }}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'sections' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <List size={16} /> Sections
        </button>
        <button 
          onClick={() => { setActiveTab('design'); setEditingSectionId(null); }}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'design' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Palette size={16} /> Design
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {activeTab === 'details' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profile Images</label>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-xs text-slate-400 mb-1 block">Avatar URL</span>
                   <input 
                    type="text" 
                    value={data.personalInfo.avatarUrl}
                    onChange={(e) => handleInfoChange('avatarUrl', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                 </div>
                 <div>
                   <span className="text-xs text-slate-400 mb-1 block">Cover URL</span>
                   <input 
                    type="text" 
                    value={data.personalInfo.coverUrl}
                    onChange={(e) => handleInfoChange('coverUrl', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                 </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Basic Info</label>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Full Name"
                  value={data.personalInfo.fullName}
                  onChange={(e) => handleInfoChange('fullName', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="text" placeholder="Job Title"
                  value={data.personalInfo.title}
                  onChange={(e) => handleInfoChange('title', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="text" placeholder="Company"
                  value={data.personalInfo.company}
                  onChange={(e) => handleInfoChange('company', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Info</label>
              <div className="space-y-3">
                <input 
                  type="email" placeholder="Email Address"
                  value={data.personalInfo.email}
                  onChange={(e) => handleInfoChange('email', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="tel" placeholder="Phone Number"
                  value={data.personalInfo.phone}
                  onChange={(e) => handleInfoChange('phone', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input 
                  type="text" placeholder="Location"
                  value={data.personalInfo.location}
                  onChange={(e) => handleInfoChange('location', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                 <input 
                  type="text" placeholder="Website (no http)"
                  value={data.personalInfo.website}
                  onChange={(e) => handleInfoChange('website', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="h-full">
             {editingSectionId ? (
                 renderSectionEditor()
             ) : (
                 <div className="space-y-4 animate-in fade-in duration-300 pb-20">
                    <p className="text-sm text-slate-500 mb-4">Drag to reorder sections.</p>
                    <DndContext 
                      sensors={sensors} 
                      collisionDetection={closestCenter} 
                      onDragEnd={handleSectionDragEnd}
                    >
                      <SortableContext 
                        items={data.sections} 
                        strategy={verticalListSortingStrategy}
                      >
                        {data.sections.map((section) => (
                          <SortableSectionItem 
                            key={section.id} 
                            id={section.id} 
                            section={section} 
                            onToggle={toggleSection}
                            onEdit={setEditingSectionId}
                            onDelete={deleteSection}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>

                    <div className="relative mt-4">
                        <button 
                            onClick={() => setShowAddSection(!showAddSection)}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors shadow-lg"
                        >
                            <Plus size={20} /> Add Section
                        </button>
                        
                        {showAddSection && (
                            <div className="absolute bottom-full left-0 w-full bg-white shadow-xl rounded-lg border border-slate-200 mb-2 p-2 grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 fade-in">
                                <button onClick={() => addSection('services')} className="p-3 text-left hover:bg-slate-50 rounded group">
                                    <List size={20} className="mb-1 text-indigo-500" />
                                    <span className="block text-sm font-semibold">Services</span>
                                    <span className="block text-xs text-slate-400">List of items</span>
                                </button>
                                <button onClick={() => addSection('rich-text')} className="p-3 text-left hover:bg-slate-50 rounded group">
                                    <Type size={20} className="mb-1 text-indigo-500" />
                                    <span className="block text-sm font-semibold">Rich Text</span>
                                    <span className="block text-xs text-slate-400">Custom content</span>
                                </button>
                                {/* Add more section types if needed */}
                            </div>
                        )}
                    </div>
                 </div>
             )}
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Template</label>
                <div className="grid grid-cols-2 gap-3">
                   {[TemplateType.MODERN, TemplateType.ELEGANT, TemplateType.CREATIVE].map((t) => (
                      <button
                        key={t}
                        onClick={() => onChange({ ...data, template: t })}
                        className={`p-3 rounded-lg border-2 text-left capitalize transition-all ${data.template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                      >
                        <LayoutTemplate size={24} className="mb-2 opacity-50"/>
                        <span className="font-semibold text-sm block">{t}</span>
                      </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Accent Color</label>
                <div className="flex flex-wrap gap-3">
                   {AVAILABLE_COLORS.map(color => (
                     <button
                       key={color}
                       onClick={() => onChange({ ...data, themeColor: color })}
                       className={`w-10 h-10 rounded-full shadow-sm transition-transform hover:scale-110 flex items-center justify-center ${data.themeColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                       style={{ backgroundColor: color }}
                     >
                        {data.themeColor === color && <Check size={16} className="text-white" />}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};