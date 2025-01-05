"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  FaHome, 
  FaCalendarAlt, 
  FaMapMarkedAlt, 
  FaFileAlt, 
  FaRegCalendarAlt, 
  FaBus,
} from 'react-icons/fa';
import Card from '@/components/ui/Card';
import CardContent from '@/components/ui/CardContent';
import ScrollArea from '@/components/ui/ScrollArea';
import dynamic from 'next/dynamic';
import { EventsList } from '@/components/Event';
import { NotesViewer } from '@/components/Notes';
import Timetable from '@/components/Timetable';
import TodoSection from '@/components/Todo';
import StickyNotes from '@/components/StickyNotes';
import ThemeToggle from '@/components/ThemeToggle'
const CampusMap = dynamic(() => import('@/components/CampusMap'), { ssr: false });

interface User {
  name: string;
  email: string;
  class: string;
  department: string;
  reg_no: string;
  semester: string;
}

interface Period {
  period: number;
  subject: string;
  time: string;
  room: string;
}


interface DashboardContent {
  title: string;
  content: React.ReactNode;
  icon: React.ElementType;
}

interface ContentTypes {
  dashboard: DashboardContent[];
  map: DashboardContent[];
  notes: React.ReactNode;
  events: DashboardContent[];
  bus: DashboardContent[];
  [key: string]: DashboardContent[] | React.ReactNode;
}

interface DashboardItemProps {
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const DashboardItem = ({ icon: Icon, title, content }:DashboardItemProps) => (
  <Card className="mb-6 dark:bg-gray-800">
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-black dark:text-white text-lg">{title}</h3>
      </div>
      <div className="text-gray-800 dark:text-gray-200">{content}</div>
    </CardContent>
  </Card>
);


const SidebarItem = ({ icon: Icon, label, active, onClick }:SidebarItemProps) => (
  <li
    onClick={onClick}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
      transition-colors duration-200 
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </li>
);


const getGreeting = (currentTime:Date): string => {
  const hours = currentTime.getHours();
  if (hours >= 0 && hours < 12) {
    return "Good morning";
  } else if (hours >= 12 && hours < 16) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth() as { 
    isAuthenticated: boolean; 
    user: User | null 
  };
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [nextPeriod, setNextPeriod] = useState<Period | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return null;
  }
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "map", label: "Map", icon: FaMapMarkedAlt },
    { id: "notes", label: "Notes", icon: FaFileAlt },
    { id: "events", label: "Events", icon: FaRegCalendarAlt },
    { id: "bus", label: "Bus Timing", icon: FaBus },
  ];
  
  const renderContent = ():React.ReactNode => {
    if (activeTab === "timetable") {
      return (
        <Timetable
          user={user}
          currentTime={currentTime}
          currentPeriod={currentPeriod}
          nextPeriod={nextPeriod}
          setCurrentPeriod={setCurrentPeriod}
          setNextPeriod={setNextPeriod}
        />
      );
    }
    
    const contents: ContentTypes = {
      dashboard: [{
        title: "Welcome to the Acadassist",
        content: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {getGreeting(currentTime)}, {user?.name}!
              </h2>
              <img src="/images/AcadAssist.png" alt="AcadAssist Logo" width={150} height={40} 
                className="object-contain" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  Student Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-purple-600 dark:text-purple-300">
                    <p><span className="font-medium">Name:</span> {user?.name}</p>
                    <p><span className="font-medium">Class:</span> {user?.class}</p>
                    <p><span className="font-medium">Department:</span> {user?.department}</p>
                    <p><span className="font-medium">Reg No:</span> {user?.reg_no}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Current Class</h3>
                  <p className="text-blue-600 dark:text-blue-300">
                    {currentPeriod ? `${currentPeriod.subject} (Room ${currentPeriod.room})` : 'No ongoing class'}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Next Class</h3>
                  <p className="text-green-600 dark:text-green-300">
                    {nextPeriod ? `${nextPeriod?.subject} (Room ${nextPeriod.room})` : 'No upcoming classes'}
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Today's Tasks</h3>
                  <TodoSection />
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Sticky Notes</h3>
                  <StickyNotes userEmail={user?.email} />
                </div>
              </div>
            </div>
          </div>
        ),
        icon: FaHome
      }],
      map: [{
        title: "Campus Map",
        content: (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Campus Map</h1>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <CampusMap />
            </div>
          </div>
        ),
        icon: FaMapMarkedAlt
      }],
      notes: (
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Notes</h2>
          <NotesViewer user={user} />
        </div>
      ),
      events: [{
        title: "Upcoming Events",
        content: (
          <div className="space-y-4">
              <EventsList />
          </div>
        ),
        icon: FaRegCalendarAlt
      }],
      bus: [{
        title: "Bus Schedule",
        content: (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Next Bus</h3>
              <p className="text-purple-600">Shuttle service information will appear here</p>
            </div>
          </div>
        ),
        icon: FaBus
      }]
    };

    return contents[activeTab] && Array.isArray(contents[activeTab]) 
      ? contents[activeTab].map((item, index) => (
          <DashboardItem
            key={index}
            icon={item.icon}
            title={item.title}
            content={item.content}
          />
        ))
      : contents[activeTab];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
       <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-center items-center mb-6">
            <img src="/images/AcadAssist.png"alt="AcadAssist Logo" width={150} height={40}  className="object-contain"/>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <ScrollArea className="h-full">
          {renderContent()}
        </ScrollArea>
      </main>
      <ThemeToggle />
    </div>
  );
}
