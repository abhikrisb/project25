import React, { useState, useEffect } from 'react';
import { FaClock, FaMapMarkerAlt, FaUsers, FaRegCalendarAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

if (typeof window !== "undefined") {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}
interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: 'CLUB' | 'CAMPUS';
  club_name?: string;
  registration_link?: string;
  thumbnail_url?: string;
  max_participants?: number;
  current_participants?: number;
  organizer: string;
  coordinates: [number, number];
}

const EventDetails = ({ event, onBack }) => {
  const position: [number, number] = [event.coordinates['x'], event.coordinates['y']];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors">
      <div className="relative">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-700 p-2 rounded-full 
            shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-6 h-6 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src={event.thumbnail_url || '/images/default-event.jpg'}
          alt={event.title}
          className="w-full h-64 object-cover rounded-t-xl"
        />
      </div>

      <div className="p-6">
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            event.event_type === 'CLUB' 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {event.event_type === 'CLUB' ? event.club_name : 'Campus Event'}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaClock className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
            <span>{new Date(event.event_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaMapMarkerAlt className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
            <span>{event.location}</span>
          </div>
          {event.max_participants && (
            <div className="col-span-2">
              <div className="flex items-center mb-2 text-gray-600 dark:text-gray-300">
                <FaUsers className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                <span>{event.current_participants}/{event.max_participants} Participants</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(event.current_participants! / event.max_participants) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg overflow-hidden h-[400px]">
          {typeof window !== 'undefined' && (
            <MapContainer 
              center={position}
              zoom={18}
              scrollWheelZoom={true}
              style={{ height: "400px", width: "100%" }}
              maxZoom={18}
              minZoom={18}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              />
              <Marker position={position}>
                <Popup className="dark:bg-gray-800 dark:text-white">{event.title}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>

        {event.registration_link && (
          <a
            href={event.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-6 py-3 bg-blue-600 dark:bg-blue-500 
              text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Register Now
          </a>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, onClick }: { event: Event; onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer 
        hover:shadow-xl transition-all duration-200"
    >
      <div className="relative h-48">
        <img 
          src={event.thumbnail_url || '/images/default-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.event_type === 'CLUB' 
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {event.event_type === 'CLUB' ? event.club_name : 'Campus Event'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaClock className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            {new Date(event.event_date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CLUB' | 'CAMPUS'>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents(filter);
  }, [filter]);

  const fetchEvents = async (type: string) => {
    setLoading(true);
    try {
      const url = type === 'ALL' 
        ? 'https://122.164.14.248:5000/api/events'
        : `https://122.164.14.248:5000/api/events?type=${type}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EventDetails event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Campus Events</h2>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['ALL', 'CLUB', 'CAMPUS'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as 'ALL' | 'CLUB' | 'CAMPUS')}
              className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                filter === type 
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {type === 'ALL' ? 'All Events' : `${type}`}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-xl"></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-b-xl">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onClick={() => setSelectedEvent(event)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <FaRegCalendarAlt className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later for new events</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { EventsList };