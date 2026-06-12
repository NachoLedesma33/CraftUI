import React, { useState, useMemo } from "react";
import { Search, Heart, Star, Home, User, Settings, Mail, Phone, Camera, Image, Video, Music, Book, Calendar, Clock, MapPin, Bell, Shield, Lock, Globe, Sun, Moon, Cloud, Zap, Smile, ThumbsUp, ThumbsDown, Flag, Tag, Trash2, Edit, Copy, Plus, Minus, X, Check, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Menu, MoreHorizontal, Download, Upload, ExternalLink, Link, Share2, ShoppingCart, CreditCard, DollarSign, TrendingUp, BarChart, Folder, FileText, Clipboard, PenTool, Bold, Italic, Underline, Code, Terminal, Database, Server, Smartphone, Tablet, Monitor, Wifi, Battery, Play, Pause, SkipForward, SkipBack, Volume2, MessageCircle, MessageSquare, Send, Inbox, LogIn, LogOut, Eye, EyeOff, AlertCircle, AlertTriangle, Info, HelpCircle, RefreshCw, RotateCw, Move, Maximize2, Minimize2, Grid3x3, Columns3, LayoutGrid, PanelLeft, PanelRight, Cpu, HardDrive, Printer, Gift, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Heart, Star, Home, User, Settings, Search, Mail, Phone,
  Camera, Image, Video, Music, Book, Calendar, Clock, MapPin,
  Bell, Shield, Lock, Globe, Sun, Moon, Cloud, Zap,
  Smile, ThumbsUp, ThumbsDown, Flag, Tag, Trash2, Edit, Copy,
  Plus, Minus, X, Check, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Menu, MoreHorizontal,
  Download, Upload, ExternalLink, Link, Share2,
  ShoppingCart, CreditCard, DollarSign, TrendingUp, BarChart,
  Folder, FileText, Clipboard, PenTool, Bold, Italic, Underline,
  Code, Terminal, Database, Server, Smartphone, Tablet, Monitor,
  Wifi, Battery, Play, Pause, SkipForward, SkipBack, Volume2,
  MessageCircle, MessageSquare, Send, Inbox, LogIn, LogOut,
  Eye, EyeOff, AlertCircle, AlertTriangle, Info, HelpCircle,
  RefreshCw, RotateCw, Move, Maximize2, Minimize2,
  Grid3x3, Columns3, LayoutGrid, PanelLeft, PanelRight,
  Cpu, HardDrive, Printer, Gift, Award,
};

const POPULAR_ICONS = Object.keys(ICON_MAP);

interface IconBrowserProps {
  onSelect: (iconName: string) => void;
  currentIcon?: string;
}

export const IconBrowser: React.FC<IconBrowserProps> = ({ onSelect, currentIcon }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return POPULAR_ICONS;
    const q = search.toLowerCase();
    return POPULAR_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-7 pr-2 py-1.5 text-xs bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
          placeholder="Search icons..."
        />
      </div>
      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
        {filtered.map((name) => {
          const LucideIcon = ICON_MAP[name];
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`p-1.5 border-2 flex items-center justify-center transition-all hover:scale-110 hover:bg-[var(--bg-tertiary)] ${
                currentIcon === name ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"
              }`}
              title={name}
            >
              <LucideIcon size={16} className="text-[var(--text-secondary)]" />
            </button>
          );
        })}
      </div>
      {currentIcon && filtered.includes(currentIcon) && (
        <div className="text-[10px] text-[var(--text-muted)] text-center italic">
          {currentIcon} selected
        </div>
      )}
    </div>
  );
};
