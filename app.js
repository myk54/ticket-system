// Ticket Management System - Netlify Ready Version
const { useState, useEffect } = React;
const { Search, Plus, X, Edit2, Trash2, FileText, Download, Upload, Eye, Calendar, CheckCircle, Clock, AlertCircle } = lucide;

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

  const loadTickets = () => {
    try {
      const stored = localStorage.getItem('tickets');
      if (stored) {
        setTickets(JSON.parse(stored));
      }
    } catch (error) {
      console.log('No existing tickets found');
    }
  };

  const saveTickets = (updatedTickets) => {
    try {
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
    } catch (error) {
      console.error('Error saving tickets:', error);
      alert('خطأ في حفظ البيانات / Error saving data');
    }
  };

  const handleAddTicket = () => {
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

    saveTickets([...tickets, newTicket]);
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

  const handleUpdateTicket = () => {
    const updatedTickets = tickets.map(t => 
      t.id === editingTicket.id ? { ...editingTicket, updatedAt: new Date().toISOString() } : t
    );
    saveTickets(updatedTickets);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه التذكرة؟ / Are you sure you want to delete this ticket?')) {
      try {
        const updatedTickets = tickets.filter(t => t.id !== id);
        saveTickets(updatedTickets);
        alert('✅ تم حذف التذكرة بنجاح / Ticket deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('❌ خطأ في الحذف / Error deleting ticket');
      }
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف جميع التذاكر؟ هذا الإجراء لا يمكن التراجع عنه!\n\nAre you sure you want to delete ALL tickets? This cannot be undone!')) {
      if (window.confirm('تأكيد نهائي: سيتم حذف ' + tickets.length + ' تذكرة\n\nFinal confirmation: ' + tickets.length + ' tickets will be deleted')) {
        try {
          saveTickets([]);
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

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        let importedData = [];
        const fileContent = event.target.result;

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          
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
          else if (jsonData.messages && Array.isArray(jsonData.messages)) {
            importedData = jsonData.messages
              .filter(msg => msg.text || msg.photo)
              .map((msg, index) => {
                let textContent = '';
                if (typeof msg.text === 'string') {
                  textContent = msg.text;
                } else if (Array.isArray(msg.text)) {
                  textContent = msg.text.map(t => typeof t === 'string' ? t : t.text || '').join(' ');
                } else if (msg.text && msg.text.text) {
                  textContent = msg.text.text;
                }
                
                const images = [];
                if (msg.photo) images.push(msg.photo);
                if (msg.file) images.push(msg.file);
                
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
        else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(fileContent, 'text/html');
          
          const messageContainers = doc.querySelectorAll('.message, .body, [class*="message"]');
          
          if (messageContainers.length > 0) {
            messageContainers.forEach((msgEl, index) => {
              const textEl = msgEl.querySelector('.text, .body_details, [class*="text"]');
              const textContent = textEl ? textEl.textContent.trim() : msgEl.textContent.trim();
              
              const images = Array.from(msgEl.querySelectorAll('img')).map(img => {
                return img.getAttribute('src') || img.getAttribute('data-src') || '';
              }).filter(src => src && src.length > 0);
              
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
          }
        }

        if (importedData.length > 0) {
          saveTickets([...tickets, ...importedData]);
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

  const handleImport = () => {
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
        saveTickets([...tickets, ...newTickets]);
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
    link.download = `tickets_${new Date().toISOString().split('T')[0]}.json`;
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
    React.createElement('div', { className: "bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-2xl mb-6 border border-gray-200" },
      React.createElement('h3', { className: "text-2xl font-bold mb-6 text-gray-800 flex items-center justify-between" },
        React.createElement('span', null, isEditing ? 'Edit Ticket / تعديل التذكرة' : 'New Ticket / تذكرة جديدة'),
        React.createElement('button', { onClick: onCancel, className: "text-gray-400 hover:text-gray-600" },
          React.createElement(X, { size: 24 })
        )
      ),
      
      React.createElement('div', { className: "space-y-5" },
        React.createElement('div', null,
          React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Name / Company | الاسم / الشركة'),
          React.createElement('input', {
            type: "text",
            value: ticket.name,
            onChange: (e) => setTicket({ ...ticket, name: e.target.value }),
            className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all",
            placeholder: "Enter company or person name | اسم الشركة أو الشخص"
          })
        ),

        React.createElement('div', null,
          React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Link | الرابط'),
          React.createElement('input', {
            type: "url",
            value: ticket.link,
            onChange: (e) => setTicket({ ...ticket, link: e.target.value }),
            className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all",
            placeholder: "https://example.com"
          })
        ),

        React.createElement('div', null,
          React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Details | التفاصيل'),
          React.createElement('textarea', {
            value: ticket.details,
            onChange: (e) => setTicket({ ...ticket, details: e.target.value }),
            className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all h-32 resize-none",
            placeholder: "Enter ticket details in English or Arabic | أدخل تفاصيل التذكرة بالعربية أو الإنجليزية"
          })
        ),

        React.createElement('div', { className: "grid grid-cols-2 gap-4" },
          React.createElement('div', null,
            React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Status | الحالة'),
            React.createElement('select', {
              value: ticket.status,
              onChange: (e) => setTicket({ ...ticket, status: e.target.value }),
              className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all bg-white"
            },
              React.createElement('option', { value: "pending" }, 'Pending | قيد الانتظار'),
              React.createElement('option', { value: "in-progress" }, 'In Progress | قيد التنفيذ'),
              React.createElement('option', { value: "completed" }, 'Completed | مكتمل')
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Date | التاريخ'),
            React.createElement('input', {
              type: "date",
              value: ticket.date,
              onChange: (e) => setTicket({ ...ticket, date: e.target.value }),
              className: "w-full p-3 border-2 border-gray-200 rounded-xl focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            })
          )
        ),

        React.createElement('div', null,
          React.createElement('label', { className: "block mb-2 font-semibold text-gray-700 text-sm" }, 'Attachments | المرفقات'),
          React.createElement('div', { className: "border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer bg-gray-50" },
            React.createElement('input', {
              type: "file",
              accept: "image/*",
              multiple: true,
              onChange: (e) => handleImageUpload(e, isEditing),
              className: "hidden",
              id: "file-upload"
            }),
            React.createElement('label', { htmlFor: "file-upload", className: "cursor-pointer" },
              React.createElement(Upload, { className: "mx-auto mb-2 text-gray-400", size: 32 }),
              React.createElement('p', { className: "text-sm text-gray-600" }, 'Click to upload images | انقر لرفع الصور'),
              React.createElement('p', { className: "text-xs text-gray-400 mt-1" }, 'Max 5MB per image')
            )
          ),
          
          ticket.attachments.length > 0 && React.createElement('div', { className: "grid grid-cols-3 gap-3 mt-4" },
            ticket.attachments.map((img, index) =>
              React.createElement('div', { key: index, className: "relative group" },
                React.createElement('img', { src: img, alt: `Attachment ${index + 1}`, className: "w-full h-32 object-cover rounded-xl" }),
                React.createElement('button', {
                  onClick: () => removeAttachment(index, isEditing),
                  className: "absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                },
                  React.createElement(X, { size: 16 })
                )
              )
            )
          )
        )
      ),

      React.createElement('div', { className: "flex gap-3 mt-8" },
        React.createElement('button', {
          onClick: onSave,
          className: "flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 font-semibold shadow-lg hover:shadow-xl transition-all"
        }, 'Save | حفظ'),
        React.createElement('button', {
          onClick: onCancel,
          className: "flex-1 bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-all"
        }, 'Cancel | إلغاء')
      )
    )
  );

  const TicketCard = ({ ticket }) => (
    React.createElement('div', { className: "bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group" },
      React.createElement('div', { className: "p-5" },
        React.createElement('div', { className: "flex justify-between items-start mb-4" },
          React.createElement('div', { className: "flex gap-2" },
            React.createElement('button', {
              onClick: () => setViewingTicket(ticket),
              className: "text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all",
              title: "View"
            }, React.createElement(Eye, { size: 18 })),
            React.createElement('button', {
              onClick: () => setEditingTicket(ticket),
              className: "text-green-500 hover:text-green-700 p-2 hover:bg-green-50 rounded-lg transition-all",
              title: "Edit"
            }, React.createElement(Edit2, { size: 18 })),
            React.createElement('button', {
              onClick: () => handleDeleteTicket(ticket.id),
              className: "text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all",
              title: "Delete"
            }, React.createElement(Trash2, { size: 18 }))
          ),
          React.createElement('span', { className: "bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-bold" },
            '#', ticket.ticketNumber
          )
        ),

        React.createElement('h3', { className: "text-lg font-bold mb-3 text-gray-800 line-clamp-2" }, ticket.name),
        
        ticket.link && React.createElement('a', {
          href: ticket.link,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-500 hover:text-blue-700 mb-3 block text-sm truncate hover:underline"
        }, '🔗 ', ticket.link),

        React.createElement('p', { className: "text-gray-600 mb-4 text-sm line-clamp-3" }, ticket.details),

        ticket.attachments.length > 0 && React.createElement('div', { className: "grid grid-cols-2 gap-2 mb-4" },
          ticket.attachments.slice(0, 2).map((img, index) =>
            React.createElement('img', {
              key: index,
              src: img,
              alt: `Attachment ${index + 1}`,
              className: "w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform",
              onClick: () => window.open(img, '_blank')
            })
          ),
          ticket.attachments.length > 2 && React.createElement('div', { className: "flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 text-sm font-semibold" },
            '+', ticket.attachments.length - 2, ' more'
          )
        ),

        React.createElement('div', { className: "flex justify-between items-center pt-4 border-t border-gray-100" },
          React.createElement('div', { className: "flex items-center gap-2 text-xs text-gray-500" },
            React.createElement(Calendar, { size: 14 }),
            ticket.date
          ),
          React.createElement('span', {
            className: `px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
              ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            }`
          },
            ticket.status === 'completed' ? React.createElement(CheckCircle, { size: 14 }) :
            ticket.status === 'in-progress' ? React.createElement(Clock, { size: 14 }) : React.createElement(AlertCircle, { size: 14 }),
            ticket.status === 'completed' ? 'Completed' :
            ticket.status === 'in-progress' ? 'In Progress' : 'Pending'
          )
        )
      )
    )
  );

  return (
    React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" },
      React.createElement('div', { className: "max-w-7xl mx-auto" },
        React.createElement('div', { className: "bg-gradient-to-r from-slate-700 to-slate-800 p-8 rounded-2xl shadow-xl mb-8 text-white border border-slate-600" },
          React.createElement('div', { className: "flex justify-between items-center mb-6" },
            React.createElement('div', null,
              React.createElement('h1', { className: "text-4xl font-bold mb-2" }, 'Ticket Management System'),
              React.createElement('p', { className: "text-slate-300 text-lg" }, 'نظام إدارة التذاكر المتقدم')
            ),
            React.createElement('div', { className: "flex gap-3" },
              React.createElement('button', {
                onClick: handleDeleteAll,
                className: "bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 font-semibold shadow-lg flex items-center gap-2 transition-all",
                title: "Delete All Tickets"
              },
                React.createElement(Trash2, { size: 20 }),
                'Delete All | حذف الكل'
              ),
              React.createElement('button', {
                onClick: () => setShowImportModal(true),
                className: "bg-white text-slate-700 px-5 py-3 rounded-lg hover:bg-slate-50 font-semibold shadow-lg flex items-center gap-2 transition-all"
              },
                React.createElement(Upload, { size: 20 }),
                'Import | استيراد'
              ),
              React.createElement('button', {
                onClick: exportToJSON,
                className: "bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 font-semibold shadow-lg flex items-center gap-2 transition-all"
              },
                React.createElement(Download, { size: 20 }),
                'Export | تصدير'
              )
            )
          ),

          React.createElement('div', { className: "grid grid-cols-4 gap-4" },
            React.createElement('div', { className: "bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20" },
              React.createElement('p', { className: "text-sm opacity-90" }, 'Total | الكل'),
              React.createElement('p', { className: "text-3xl font-bold" }, statusCounts.all)
            ),
            React.createElement('div', { className: "bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30" },
              React.createElement('p', { className: "text-sm opacity-90" }, 'Pending | انتظار'),
              React.createElement('p', { className: "text-3xl font-bold" }, statusCounts.pending)
            ),
            React.createElement('div', { className: "bg-blue-500/20 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30" },
              React.createElement('p', { className: "text-sm opacity-90" }, 'In Progress | تنفيذ'),
              React.createElement('p', { className: "text-3xl font-bold" }, status
