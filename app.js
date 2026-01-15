import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Trash2, FileText, Download, Upload, Eye, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [currentTicket, setCurrentTicket] = useState({
    name: '',
    link: '',
    details: '',
    attachments: [],
    status: 'pending',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const result = await window.storage.get('tickets');
      if (result && result.value) {
        setTickets(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing tickets found');
    }
  };

  const saveTickets = async (updatedTickets) => {
    try {
      await window.storage.set('tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
    } catch (error) {
      console.error('Error saving tickets:', error);
      alert('خطأ في حفظ البيانات / Error saving data');
    }
  };

  const handleAddTicket = async () => {
    if (!currentTicket.name || !currentTicket.details) {
      alert('الرجاء إدخال الاسم والتفاصيل / Please enter name and details');
      return;
    }

    const newTicket = {
      ...currentTicket,
      id: Date.now(),
      ticketNumber: tickets.length + 1,
      createdAt: new Date().toISOString()
    };

    await saveTickets([...tickets, newTicket]);
    setCurrentTicket({
      name: '',
      link: '',
      details: '',
      attachments: [],
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddingTicket(false);
  };

  const handleUpdateTicket = async () => {
    const updatedTickets = tickets.map(t =>
      t.id === editingTicket.id ? { ...editingTicket, updatedAt: new Date().toISOString() } : t
    );
    await saveTickets(updatedTickets);
    setEditingTicket(null);
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه التذكرة؟ / Are you sure you want to delete this ticket?')) {
      try {
        const updatedTickets = tickets.filter(t => t.id !== id);
        await saveTickets(updatedTickets);
        alert('✅ تم حذف التذكرة بنجاح / Ticket deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('❌ خطأ في الحذف / Error deleting ticket');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف جميع التذاكر؟ هذا الإجراء لا يمكن التراجع عنه!\n\nAre you sure you want to delete ALL tickets? This cannot be undone!')) {
      if (window.confirm('تأكيد نهائي: سيتم حذف ' + tickets.length + ' تذكرة\n\nFinal confirmation: ' + tickets.length + ' tickets will be deleted')) {
        try {
          await saveTickets([]);
          alert('✅ تم حذف جميع التذاكر / All tickets deleted');
        } catch (error) {
          console.error('Delete all error:', error);
          alert('❌ خطأ في الحذف / Error deleting tickets');
        }
      }
    }
  };

  const handleImageUpload = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 5000000) {
        alert('حجم الصورة كبير جداً (الحد الأقصى 5MB) / Image too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        if (isEditing) {
          setEditingTicket(prev => ({
            ...prev,
            attachments: [...prev.attachments, imageData]
          }));
        } else {
          setCurrentTicket(prev => ({
            ...prev,
            attachments: [...prev.attachments, imageData]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index, isEditing = false) => {
    if (isEditing) {
      setEditingTicket(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }));
    } else {
      setCurrentTicket(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
 
    reader.onload = async (event) => {
      try {
        let importedData = [];
        const fileContent = event.target.result;

        // Handle JSON import
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
 
          // Check if it's an array of tickets (direct format)
          if (Array.isArray(jsonData)) {
            importedData = jsonData.map((item, index) => ({
              id: Date.now() + index,
              ticketNumber: tickets.length + index + 1,
              name: item.name || item.title || `Ticket ${tickets.length + index + 1}`,
              link: item.link || item.url || '',
              details: item.details || item.description || item.text || '',
              attachments: item.attachments || [],
              status: item.status || 'pending',
              date: item.date || new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString()
            }));
          }
          // Telegram JSON format
          else if (jsonData.messages && Array.isArray(jsonData.messages)) {
            importedData = jsonData.messages
              .filter(msg => msg.text || msg.photo)
              .map((msg, index) => {
                // Extract text content
                let textContent = '';
                if (typeof msg.text === 'string') {
                  textContent = msg.text;
                } else if (Array.isArray(msg.text)) {
                  textContent = msg.text.map(t => typeof t === 'string' ? t : t.text || '').join(' ');
                } else if (msg.text && msg.text.text) {
                  textContent = msg.text.text;
                }
 
                // Extract images
                const images = [];
                if (msg.photo) {
                  images.push(msg.photo);
                }
                if (msg.file) {
                  images.push(msg.file);
                }
 
                // Extract URLs from text
                const urlMatch = textContent.match(/(https?:\/\/[^\s]+)/);
 
                return {
                  id: Date.now() + index * 100,
                  ticketNumber: tickets.length + index + 1,
                  name: msg.from || msg.author || textContent.substring(0, 50) || `Ticket ${tickets.length + index + 1}`,
                  link: urlMatch ? urlMatch[0] : '',
                  details: textContent || 'No details',
                  attachments: images,
                  status: 'pending',
                  date: msg.date ? new Date(msg.date * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString()
                };
              });
          }
        }
        // Handle HTML import
        else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(fileContent, 'text/html');
 
          // Look for Telegram message structure
          const messageContainers = doc.querySelectorAll('.message, .body, [class*="message"]');
 
          if (messageContainers.length > 0) {
            messageContainers.forEach((msgEl, index) => {
              const textEl = msgEl.querySelector('.text, .body_details, [class*="text"]');
              const textContent = textEl ? textEl.textContent.trim() : msgEl.textContent.trim();
 
              // Get all images in this message
              const images = Array.from(msgEl.querySelectorAll('img')).map(img => {
                // Handle both src and data-src attributes
                return img.getAttribute('src') || img.getAttribute('data-src') || '';
              }).filter(src => src && src.length > 0);
 
              // Get links
              const links = Array.from(msgEl.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.startsWith('http'));
 
              if (textContent && textContent.length > 3) {
                importedData.push({
                  id: Date.now() + index * 100,
                  ticketNumber: tickets.length + index + 1,
                  name: textContent.substring(0, 60) || `Ticket ${tickets.length + index + 1}`,
                  link: links[0] || '',
                  details: textContent,
                  attachments: images,
                  status: 'pending',
                  date: new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString()
                });
              }
            });
          } else {
            // Fallback: parse by paragraphs
            const paragraphs = doc.querySelectorAll('p, div');
            paragraphs.forEach((el, index) => {
              const text = el.textContent.trim();
              if (text.length > 10) {
                const imgs = Array.from(el.querySelectorAll('img')).map(img => img.src);
                const links = Array.from(el.querySelectorAll('a')).map(a => a.href);
 
                importedData.push({
                  id: Date.now() + index * 100,
                  ticketNumber: tickets.length + index + 1,
                  name: text.substring(0, 60),
                  link: links[0] || '',
                  details: text,
                  attachments: imgs,
                  status: 'pending',
                  date: new Date().toISOString().split('T')[0],
                  createdAt: new Date().toISOString()
                });
              }
            });
          }
        }

        if (importedData.length > 0) {
          await saveTickets([...tickets, ...importedData]);
          setShowImportModal(false);
          alert(`✅ تم استيراد ${importedData.length} تذكرة بنجاح / Successfully imported ${importedData.length} tickets`);
        } else {
          alert('⚠️ لم يتم العثور على بيانات صالحة / No valid data found. Please check the file format.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ خطأ في الاستيراد / Import error: ' + error.message);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('الرجاء إدخال البيانات / Please enter data');
      return;
    }

    try {
      const messages = importText.split(/\n\n+/);
      const newTickets = [];

      messages.forEach((msg, index) => {
        const nameMatch = msg.match(/اسم المشروع او الشركة[:\s]+(.*?)(?:\n|$)/i) ||
                         msg.match(/name[:\s]+(.*?)(?:\n|$)/i);
        const linkMatch = msg.match(/الرواط[:\s]+(.*?)(?:\n|$)/i) ||
                         msg.match(/link[:\s]+(.*?)(?:\n|$)/i) ||
                         msg.match(/(https?:\/\/[^\s]+)/i);
        const detailsMatch = msg.match(/التفاصيل[:\s]+([\s\S]*?)(?=\n-|$)/i) ||
                            msg.match(/details[:\s]+([\s\S]*?)(?=\n-|$)/i);

        if (nameMatch || detailsMatch) {
          newTickets.push({
            id: Date.now() + index,
            ticketNumber: tickets.length + newTickets.length + 1,
            name: nameMatch ? nameMatch[1].trim() : `Ticket ${tickets.length + newTickets.length + 1}`,
            link: linkMatch ? linkMatch[1].trim() : '',
            details: detailsMatch ? detailsMatch[1].trim() : msg.trim(),
            attachments: [],
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          });
        }
      });

      if (newTickets.length > 0) {
        await saveTickets([...tickets, ...newTickets]);
        setImportText('');
        setShowImportModal(false);
        alert(`تم استيراد ${newTickets.length} تذكرة بنجاح / Successfully imported ${newTickets.length} tickets`);
      } else {
        alert('لم يتم العثور على بيانات صالحة / No valid data found');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('خطأ في الاستيراد / Import error');
    }
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(tickets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets\_${new Date().toISOString().split('T')\[0]}.json`;
    link.click();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    'in-progress': tickets.filter(t => t.status === 'in-progress').length,
    completed: tickets.filter(t => t.status === 'completed').length
  };

  const TicketForm = ({ ticket, setTicket, onSave, onCancel, isEditing }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl mb-6 border border-gray-200">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center justify-between">
        <span>{isEditing ? 'Edit Ticket / تعديل التذكرة' : 'New Ticket / تذكرة جديدة'}</span>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </h3>
 
      <div className="space-y-5">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm">Name / Company | الاسم / الشركة</label>
          <input
            type="text"
            value={ticket.name}
            onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            placeholder="Enter company or person name | اسم الشركة أو الشخص"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm">Link | الرابط</label>
          <input
            type="url"
            value={ticket.link}
            onChange={(e) => setTicket({ ...ticket, link: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm">Details | التفاصيل</label>
          <textarea
            value={ticket.details}
            onChange={(e) => setTicket({ ...ticket, details: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none"
            placeholder="Enter ticket details in English or Arabic | أدخل تفاصيل التذكرة بالعربية أو الإنجليزية"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Status | الحالة</label>
            <select
              value={ticket.status}
              onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all bg-white"
            >
              <option value="pending">Pending | قيد الانتظار</option>
              <option value="in-progress">In Progress | قيد التنفيذ</option>
              <option value="completed">Completed | مكتمل</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 text-sm">Date | التاريخ</label>
            <input
              type="date"
              value={ticket.date}
              onChange={(e) => setTicket({ ...ticket, date: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700 text-sm">Attachments | المرفقات</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer bg-gray-50">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, isEditing)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm text-gray-600">Click to upload images | انقر لرفع الصور</p>
              <p className="text-xs text-gray-400 mt-1">Max 5MB per image</p>
            </label>
          </div>
 
          {ticket.attachments.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {ticket.attachments.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Attachment ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
                  <button
                    onClick={() => removeAttachment(index, isEditing)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onSave}
          className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Save | حفظ
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 px-6 py-3 rounded-xl hover:bg-gray-300 font-semibold transition-all"
        >
          Cancel | إلغاء
        </button>
      </div>
    </div>
  );

  const TicketCard = ({ ticket }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewingTicket(ticket)}
              className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
              title="View"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => setEditingTicket(ticket)}
              className="text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDeleteTicket(ticket.id)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold">
            #{ticket.ticketNumber}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-3 text-gray-800 line-clamp-2">{ticket.name}</h3>
 
        {ticket.link && (
          <a
            href={ticket.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 mb-3 block text-sm truncate hover:underline"
          >
            🔗 {ticket.link}
          </a>
        )}

        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{ticket.details}</p>

        {ticket.attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {ticket.attachments.slice(0, 2).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Attachment ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
            {ticket.attachments.length > 2 && (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 text-sm font-semibold">
                +{ticket.attachments.length - 2} more
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} />
            {ticket.date}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {ticket.status === 'completed' ? <CheckCircle size={14} /> :
             ticket.status === 'in-progress' ? <Clock size={14} /> : <AlertCircle size={14} />}
            {ticket.status === 'completed' ? 'Completed' :
             ticket.status === 'in-progress' ? 'In Progress' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-8 rounded-2xl shadow-xl mb-8 text-white border border-slate-600">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Ticket Management System</h1>
              <p className="text-slate-300 text-lg">نظام إدارة التذاكر المتقدم</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 font-semibold shadow-lg flex items-center gap-2 transition-all"
                title="Delete All Tickets"
              >
                <Trash2 size={20} />
                Delete All | حذف الكل
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white text-slate-700 px-5 py-3 rounded-lg hover:bg-slate-50 font-semibold shadow-lg flex items-center gap-2 transition-all"
              >
                <Upload size={20} />
                Import | استيراد
              </button>
              <button
                onClick={exportToJSON}
                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 font-semibold shadow-lg flex items-center gap-2 transition-all"
              >
                <Download size={20} />
                Export | تصدير
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-sm opacity-90">Total | الكل</p>
              <p className="text-3xl font-bold">{statusCounts.all}</p>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30">
              <p className="text-sm opacity-90">Pending | انتظار</p>
              <p className="text-3xl font-bold">{statusCounts.pending}</p>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
              <p className="text-sm opacity-90">In Progress | تنفيذ</p>
              <p className="text-3xl font-bold">{statusCounts['in-progress']}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/30">
              <p className="text-sm opacity-90">Completed | مكتمل</p>
              <p className="text-3xl font-bold">{statusCounts.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-\[250px]">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tickets... | ابحث عن التذاكر..."
                  className="w-full p-3 pl-12 border-2 border-gray-200 rounded-lg focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-lg focus:border-slate-600 outline-none bg-white font-semibold"
            >
              <option value="all">All Status | كل الحالات</option>
              <option value="pending">Pending | قيد الانتظار</option>
              <option value="in-progress">In Progress | قيد التنفيذ</option>
              <option value="completed">Completed | مكتمل</option>
            </select>

            <button
              onClick={() => setIsAddingTicket(true)}
              className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-semibold shadow-lg flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              New Ticket | تذكرة جديدة
            </button>
          </div>
        </div>

        {isAddingTicket && (
          <TicketForm
            ticket={currentTicket}
            setTicket={setCurrentTicket}
            onSave={handleAddTicket}
            onCancel={() => {
              setIsAddingTicket(false);
              setCurrentTicket({
                name: '',
                link: '',
                details: '',
                attachments: [],
                status: 'pending',
                date: new Date().toISOString().split('T')[0]
              });
            }}
            isEditing={false}
          />
        )}

        {editingTicket && (
          <TicketForm
            ticket={editingTicket}
            setTicket={setEditingTicket}
            onSave={handleUpdateTicket}
            onCancel={() => setEditingTicket(null)}
            isEditing={true}
          />
        )}

        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Import from Telegram | استيراد من تيليجرام</h3>
                <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Upload HTML or JSON file with images | قم برفع ملف HTML أو JSON مع الصور
              </p>
 
              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-slate-400 transition-all cursor-pointer bg-gray-50">
                    <input
                      type="file"
                      accept=".html,.htm,.json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="file-import-input"
                    />
                    <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Click to upload HTML/JSON file
                    </p>
                    <p className="text-xs text-gray-500">
                      انقر لرفع ملف HTML أو JSON
                    </p>
                  </div>
                </label>
              </div>
 
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR | أو</span>
                </div>
              </div>
 
              <p className="text-gray-600 mb-4 mt-4">Paste text manually | الصق النص يدوياً</p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg h-48 focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                placeholder="Paste your text here... | الصق النص هنا..."
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleImport}
                  className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-semibold shadow-lg transition-all"
                  disabled={!importText.trim()}
                >
                  Import Text | استيراد النص
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancel | إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-\[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Ticket #{viewingTicket.ticketNumber}</h3>
                <button onClick={() => setViewingTicket(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Name | الاسم</label>
                  <p className="text-xl font-bold">{viewingTicket.name}</p>
                </div>
                {viewingTicket.link && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-2">Link | الرابط</label>
                    <a href={viewingTicket.link} target="\_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                      {viewingTicket.link}
                    </a>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Details | التفاصيل</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingTicket.details}</p>
                </div>
                {viewingTicket.attachments.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-2">Attachments | المرفقات</label>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingTicket.attachments.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Attachment ${index + 1}`}
                          className="w-full rounded-xl cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-2">Status | الحالة</label>
                    <p className={`inline-block px-4 py-2 rounded-full font-semibold ${
                      viewingTicket.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      viewingTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {viewingTicket.status === 'completed' ? 'Completed | مكتمل' :
                       viewingTicket.status === 'in-progress' ? 'In Progress | قيد التنفيذ' : 'Pending | قيد الانتظار'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-500 block mb-2">Date | التاريخ</label>
                    <p className="font-semibold">{viewingTicket.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <FileText size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">No tickets found | لا توجد تذاكر</p>
            <p className="text-sm">Click "New Ticket" to add your first ticket | انقر على "تذكرة جديدة" لإضافة أول تذكرة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManager;