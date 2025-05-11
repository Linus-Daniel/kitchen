import {
    ArrowUpDown,
    Ban,
    Bell,
    Bookmark,
    Box,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Circle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    FileText,
    Filter,
    Frown,
    Gauge,
    HelpCircle,
    Home,
    Image,
    Info,
    Laptop,
    Loader,
    Loader2,
    Lock,
    LogIn,
    LogOut,
    Mail,
    Menu,
    MessageSquare,
    Minus,
    Moon,
    MoreHorizontal,
    Package,
    Plus,
    PlusCircle,
    RefreshCw,
    Search,
    Settings,
    Share2,
    ShoppingCart,
    Sliders,
    Smile,
    Star,
    Sun,
    Trash2,
    Truck,
    User,
    Users,
    X,
    XCircle,
  } from "lucide-react";
  
  export const Icons = {
    // General
    close: X,
    spinner: Loader2,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    menu: Menu,
    moreHorizontal: MoreHorizontal,
    plus: Plus,
    minus: Minus,
    check: Check,
    circle: Circle,
    xCircle: XCircle,
    checkCircle: CheckCircle2,
    filter: Filter,
    search: Search,
    settings: Settings,
    edit: Edit,
    trash: Trash2,
    download: Download,
    info: Info,
    help: HelpCircle,
    ban: Ban,
    clock: Clock,
    calendar: Calendar,
    share: Share2,
    image: Image,
    slider: Sliders,
    refresh: RefreshCw,
    processing:Loader,
    
    // Auth
    user: User,
    lock: Lock,
    mail: Mail,
    login: LogIn,
    logout: LogOut,
    
    // Theme
    sun: Sun,
    moon: Moon,
    laptop: Laptop,
    
    // Navigation
    home: Home,
    dashboard: Gauge,
    
    // Content
    fileText: FileText,
    message: MessageSquare,
    bookmark: Bookmark,
    
    // E-commerce
    shoppingCart: ShoppingCart,
    package: Package,
    truck: Truck,
    creditCard: CreditCard,
    dollar: DollarSign,
    box: Box,
    
    // Social
    smile: Smile,
    frown: Frown,
    star: Star,
    users: Users,
    
    // App Specific
    notification: Bell,
    
    // Brand
    logo: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    
    // Food Delivery Specific
    food: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    
    restaurant: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M3 11v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" />
        <path d="M12 19V5" />
        <path d="M8 19V5" />
        <path d="M16 19V5" />
      </svg>
    ),
    
    delivery: Truck,
    
    // Payment Status
    pending: Clock,
    completed: CheckCircle2,
    failed: XCircle,
    refunded: RefreshCw,
    
    // Order Status

    
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: Ban,
    
    // Categories
    pizza: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M6 12a6 6 0 0 1 6-6 6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
        <path d="M12 6V3" />
        <path d="M15.5 8.5 17 7" />
        <path d="M18 12h3" />
        <path d="M15.5 15.5 17 17" />
        <path d="M12 18v3" />
        <path d="M8.5 15.5 7 17" />
        <path d="M6 12H3" />
        <path d="M8.5 8.5 7 7" />
      </svg>
    ),
    
    burger: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M4 12h16" />
        <path d="M4 8h16" />
        <path d="M4 16h16" />
      </svg>
    ),
    
    drink: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m3 11 19-9-9 19-2-8-8-2z" />
      </svg>
    ),
    
    dessert: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="8" r="7" />
        <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  };
  
  export type Icon = keyof typeof Icons;