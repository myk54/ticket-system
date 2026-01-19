// =============================================
// Modern SVG Icons (Lucide-style)
// =============================================

const { createElement: h } = React;

// Base icon wrapper
const Icon = ({ children, size = 20, className = '', ...props }) => 
    h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: `icon ${className}`,
        ...props
    }, children);

// =============================================
// Action Icons
// =============================================
export const PlusIcon = (props) => Icon({ ...props, children: [
    h('line', { key: 1, x1: 12, y1: 5, x2: 12, y2: 19 }),
    h('line', { key: 2, x1: 5, y1: 12, x2: 19, y2: 12 })
]});

export const EditIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    h('path', { key: 2, d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
]});

export const TrashIcon = (props) => Icon({ ...props, children: [
    h('polyline', { key: 1, points: '3 6 5 6 21 6' }),
    h('path', { key: 2, d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    h('line', { key: 3, x1: 10, y1: 11, x2: 10, y2: 17 }),
    h('line', { key: 4, x1: 14, y1: 11, x2: 14, y2: 17 })
]});

export const EyeIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    h('circle', { key: 2, cx: 12, cy: 12, r: 3 })
]});

export const XIcon = (props) => Icon({ ...props, children: [
    h('line', { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }),
    h('line', { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 })
]});

export const CheckIcon = (props) => Icon({ ...props, children: [
    h('polyline', { key: 1, points: '20 6 9 17 4 12' })
]});

export const SaveIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
    h('polyline', { key: 2, points: '17 21 17 13 7 13 7 21' }),
    h('polyline', { key: 3, points: '7 3 7 8 15 8' })
]});

// =============================================
// Navigation Icons
// =============================================
export const SearchIcon = (props) => Icon({ ...props, children: [
    h('circle', { key: 1, cx: 11, cy: 11, r: 8 }),
    h('line', { key: 2, x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
]});

export const FilterIcon = (props) => Icon({ ...props, children: [
    h('polygon', { key: 1, points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
]});

export const DownloadIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    h('polyline', { key: 2, points: '7 10 12 15 17 10' }),
    h('line', { key: 3, x1: 12, y1: 15, x2: 12, y2: 3 })
]});

export const UploadIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    h('polyline', { key: 2, points: '17 8 12 3 7 8' }),
    h('line', { key: 3, x1: 12, y1: 3, x2: 12, y2: 15 })
]});

// =============================================
// Content Icons
// =============================================
export const BuildingIcon = (props) => Icon({ ...props, children: [
    h('rect', { key: 1, x: 4, y: 2, width: 16, height: 20, rx: 2, ry: 2 }),
    h('path', { key: 2, d: 'M9 22v-4h6v4' }),
    h('path', { key: 3, d: 'M8 6h.01' }),
    h('path', { key: 4, d: 'M16 6h.01' }),
    h('path', { key: 5, d: 'M8 10h.01' }),
    h('path', { key: 6, d: 'M16 10h.01' }),
    h('path', { key: 7, d: 'M8 14h.01' }),
    h('path', { key: 8, d: 'M16 14h.01' })
]});

export const LinkIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
    h('path', { key: 2, d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
]});

export const FileTextIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { key: 2, points: '14 2 14 8 20 8' }),
    h('line', { key: 3, x1: 16, y1: 13, x2: 8, y2: 13 }),
    h('line', { key: 4, x1: 16, y1: 17, x2: 8, y2: 17 }),
    h('polyline', { key: 5, points: '10 9 9 9 8 9' })
]});

export const CalendarIcon = (props) => Icon({ ...props, children: [
    h('rect', { key: 1, x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }),
    h('line', { key: 2, x1: 16, y1: 2, x2: 16, y2: 6 }),
    h('line', { key: 3, x1: 8, y1: 2, x2: 8, y2: 6 }),
    h('line', { key: 4, x1: 3, y1: 10, x2: 21, y2: 10 })
]});

export const TagIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
    h('line', { key: 2, x1: 7, y1: 7, x2: 7.01, y2: 7 })
]});

export const PaperclipIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48' })
]});

export const FolderIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
]});

// =============================================
// Status Icons
// =============================================
export const ClockIcon = (props) => Icon({ ...props, children: [
    h('circle', { key: 1, cx: 12, cy: 12, r: 10 }),
    h('polyline', { key: 2, points: '12 6 12 12 16 14' })
]});

export const LoaderIcon = (props) => Icon({ ...props, children: [
    h('line', { key: 1, x1: 12, y1: 2, x2: 12, y2: 6 }),
    h('line', { key: 2, x1: 12, y1: 18, x2: 12, y2: 22 }),
    h('line', { key: 3, x1: 4.93, y1: 4.93, x2: 7.76, y2: 7.76 }),
    h('line', { key: 4, x1: 16.24, y1: 16.24, x2: 19.07, y2: 19.07 }),
    h('line', { key: 5, x1: 2, y1: 12, x2: 6, y2: 12 }),
    h('line', { key: 6, x1: 18, y1: 12, x2: 22, y2: 12 }),
    h('line', { key: 7, x1: 4.93, y1: 19.07, x2: 7.76, y2: 16.24 }),
    h('line', { key: 8, x1: 16.24, y1: 7.76, x2: 19.07, y2: 4.93 })
]});

export const RefreshIcon = (props) => Icon({ ...props, children: [
    h('polyline', { key: 1, points: '23 4 23 10 17 10' }),
    h('polyline', { key: 2, points: '1 20 1 14 7 14' }),
    h('path', { key: 3, d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
]});

export const CheckCircleIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('polyline', { key: 2, points: '22 4 12 14.01 9 11.01' })
]});

// =============================================
// Stats Icons
// =============================================
export const BarChartIcon = (props) => Icon({ ...props, children: [
    h('line', { key: 1, x1: 12, y1: 20, x2: 12, y2: 10 }),
    h('line', { key: 2, x1: 18, y1: 20, x2: 18, y2: 4 }),
    h('line', { key: 3, x1: 6, y1: 20, x2: 6, y2: 16 })
]});

export const TicketIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' }),
    h('path', { key: 2, d: 'M13 5v2' }),
    h('path', { key: 3, d: 'M13 17v2' }),
    h('path', { key: 4, d: 'M13 11v2' })
]});

export const InboxIcon = (props) => Icon({ ...props, children: [
    h('polyline', { key: 1, points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
    h('path', { key: 2, d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' })
]});

// =============================================
// File Type Icons
// =============================================
export const ImageIcon = (props) => Icon({ ...props, children: [
    h('rect', { key: 1, x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
    h('circle', { key: 2, cx: 8.5, cy: 8.5, r: 1.5 }),
    h('polyline', { key: 3, points: '21 15 16 10 5 21' })
]});

export const FileIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' }),
    h('polyline', { key: 2, points: '13 2 13 9 20 9' })
]});

export const FilePdfIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { key: 2, points: '14 2 14 8 20 8' }),
    h('path', { key: 3, d: 'M10 12h4' }),
    h('path', { key: 4, d: 'M10 16h4' })
]});

export const FileSpreadsheetIcon = (props) => Icon({ ...props, children: [
    h('path', { key: 1, d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('polyline', { key: 2, points: '14 2 14 8 20 8' }),
    h('line', { key: 3, x1: 8, y1: 13, x2: 16, y2: 13 }),
    h('line', { key: 4, x1: 8, y1: 17, x2: 16, y2: 17 }),
    h('line', { key: 5, x1: 12, y1: 13, x2: 12, y2: 17 })
]});

export const ArchiveIcon = (props) => Icon({ ...props, children: [
    h('polyline', { key: 1, points: '21 8 21 21 3 21 3 8' }),
    h('rect', { key: 2, x: 1, y: 3, width: 22, height: 5 }),
    h('line', { key: 3, x1: 10, y1: 12, x2: 14, y2: 12 })
]});

// =============================================
// Export all icons as object
// =============================================
export const Icons = {
    Plus: PlusIcon,
    Edit: EditIcon,
    Trash: TrashIcon,
    Eye: EyeIcon,
    X: XIcon,
    Check: CheckIcon,
    Save: SaveIcon,
    Search: SearchIcon,
    Filter: FilterIcon,
    Download: DownloadIcon,
    Upload: UploadIcon,
    Building: BuildingIcon,
    Link: LinkIcon,
    FileText: FileTextIcon,
    Calendar: CalendarIcon,
    Tag: TagIcon,
    Paperclip: PaperclipIcon,
    Folder: FolderIcon,
    Clock: ClockIcon,
    Loader: LoaderIcon,
    Refresh: RefreshIcon,
    CheckCircle: CheckCircleIcon,
    BarChart: BarChartIcon,
    Ticket: TicketIcon,
    Inbox: InboxIcon,
    Image: ImageIcon,
    File: FileIcon,
    FilePdf: FilePdfIcon,
    FileSpreadsheet: FileSpreadsheetIcon,
    Archive: ArchiveIcon
};
