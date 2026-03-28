import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invokeFunction } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Phone, Globe, Clock, Image, Send, Star, 
  TrendingUp, Eye, MousePointerClick, MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';

// Google Business Profile Integration (section 4.5.2 & 5.2.1)
export default function GoogleBusinessProfile() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await invokeFunction('googleBusinessProfile', {
        action: 'getProfile'
      });
      
      if (response.locations && response.locations.length > 0) {
        setIsConnected(true);
        setProfile(response.locations[0]);
        loadReviews();
        loadInsights();
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const connectGBP = async () => {
    try {
      setLoading(true);
      const response = await invokeFunction('googleBusinessProfile', {
        action: 'getAuthUrl'
      });
      
      // Open OAuth window
      window.open(response.authUrl, '_blank', 'width=600,height=700');
      
      // Listen for callback
      window.addEventListener('message', handleOAuthCallback);
    } catch (error) {
      toast.error('שגיאה בחיבור לGoogle Business Profile');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (event) => {
    if (event.data.type === 'gbp-connected') {
      await checkConnection();
      toast.success('חיבור לGoogle Business Profile הצליח!');
      window.removeEventListener('message', handleOAuthCallback);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await invokeFunction('googleBusinessProfile', {
        action: 'getReviews'
      });
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await invokeFunction('googleBusinessProfile', {
        action: 'getInsights'
      });
      setInsights(response.insights || {});
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  if (!isConnected) {
    return <ConnectionScreen onConnect={connectGBP} loading={loading} />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">פרופיל</TabsTrigger>
          <TabsTrigger value="posts">פוסטים</TabsTrigger>
          <TabsTrigger value="reviews">ביקורות</TabsTrigger>
          <TabsTrigger value="insights">תובנות</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileManager profile={profile} onUpdate={checkConnection} />
        </TabsContent>

        <TabsContent value="posts">
          <PostPublisher profile={profile} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsManager reviews={reviews} onRespond={loadReviews} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsAnalytics insights={insights} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConnectionScreen({ onConnect, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-10 h-10 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        חבר את Google Business Profile
      </h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        נהל את הנוכחות העסקית שלך ב-Google Maps ובתוצאות החיפוש.
        פרסם עדכונים, הגב לביקורות, וצפה בתובנות על הלקוחות שלך.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
        <FeatureCard icon={<Send />} title="פרסום פוסטים" desc="שתף עדכונים והצעות" />
        <FeatureCard icon={<Star />} title="ניהול ביקורות" desc="הגב ללקוחות במהירות" />
        <FeatureCard icon={<TrendingUp />} title="תובנות" desc="ראה כמה אנשים מוצאים אותך" />
      </div>

      <Button 
        size="lg" 
        onClick={onConnect} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? 'מתחבר...' : 'התחבר ל-Google Business Profile'}
      </Button>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-blue-600 mb-2">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function ProfileHeader({ profile }) {
  if (!profile) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{profile.title || 'העסק שלך'}</h1>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {profile.averageRating || '0.0'} ({profile.reviewCount || 0} ביקורות)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {profile.address?.locality || 'ישראל'}
            </span>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
          <div className="text-xs opacity-80">סטטוס</div>
          <div className="font-bold">✓ מחובר</div>
        </div>
      </div>
    </div>
  );
}

function ProfileManager({ profile, onUpdate }) {
  const [formData, setFormData] = useState({
    title: profile?.title || '',
    phone: profile?.phoneNumbers?.[0]?.number || '',
    website: profile?.websiteUri || '',
    description: profile?.profile?.description || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await invokeFunction('googleBusinessProfile', {
        action: 'updateProfile',
        profileData: {
          locationName: profile.name,
          updates: {
            title: formData.title,
            phoneNumbers: [{ number: formData.phone }],
            websiteUri: formData.website,
            profile: { description: formData.description }
          }
        }
      });
      toast.success('הפרופיל עודכן בהצלחה');
      onUpdate();
    } catch (error) {
      toast.error('שגיאה בעדכון הפרופיל');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">ניהול פרופיל</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">שם העסק</label>
        <Input 
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="שם העסק"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">טלפון</label>
        <Input 
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="050-1234567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">אתר אינטרנט</label>
        <Input 
          value={formData.website}
          onChange={(e) => setFormData({...formData, website: e.target.value})}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">תיאור</label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="תאר את העסק שלך..."
          rows={4}
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'שומר...' : 'שמור שינויים'}
      </Button>
    </div>
  );
}

function PostPublisher({ profile }) {
  const [postData, setPostData] = useState({
    summary: '',
    callToAction: { type: 'LEARN_MORE', url: '' },
    media: '',
    topicType: 'STANDARD'
  });
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await invokeFunction('googleBusinessProfile', {
        action: 'createPost',
        postData: {
          ...postData,
          locationName: profile.name
        }
      });
      toast.success('הפוסט פורסם בהצלחה!');
      setPostData({ summary: '', callToAction: { type: 'LEARN_MORE', url: '' }, media: '', topicType: 'STANDARD' });
    } catch (error) {
      toast.error('שגיאה בפרסום הפוסט');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">פרסום פוסט חדש</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">תוכן הפוסט</label>
        <Textarea 
          value={postData.summary}
          onChange={(e) => setPostData({...postData, summary: e.target.value})}
          placeholder="מה תרצה לשתף עם הלקוחות שלך?"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">{postData.summary.length}/1500 תווים</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">סוג פוסט</label>
        <Select 
          value={postData.topicType}
          onValueChange={(value) => setPostData({...postData, topicType: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STANDARD">רגיל</SelectItem>
            <SelectItem value="EVENT">אירוע</SelectItem>
            <SelectItem value="OFFER">הצעה מיוחדת</SelectItem>
            <SelectItem value="ALERT">עדכון חשוב</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">קישור לפעולה (אופציונלי)</label>
        <Input 
          value={postData.callToAction.url}
          onChange={(e) => setPostData({...postData, callToAction: {...postData.callToAction, url: e.target.value}})}
          placeholder="https://..."
        />
      </div>

      <Button onClick={handlePublish} disabled={publishing || !postData.summary} className="w-full">
        <Send className="w-4 h-4 ml-2" />
        {publishing ? 'מפרסם...' : 'פרסם עכשיו'}
      </Button>
    </div>
  );
}

function ReviewsManager({ reviews, onRespond }) {
  const [selectedReview, setSelectedReview] = useState(null);
  const [response, setResponse] = useState('');
  const [responding, setResponding] = useState(false);

  const handleRespond = async () => {
    try {
      setResponding(true);
      await invokeFunction('googleBusinessProfile', {
        action: 'respondToReview',
        reviewId: selectedReview.name,
        response
      });
      toast.success('התגובה נשלחה בהצלחה!');
      setSelectedReview(null);
      setResponse('');
      onRespond();
    } catch (error) {
      toast.error('שגיאה בשליחת התגובה');
    } finally {
      setResponding(false);
    }
  };

  const responseTemplates = [
    'תודה רבה על המילים החמות! שמחנו לשרת אותך 🙏',
    'מעריכים מאוד את המשוב! נשמח לראותך שוב בקרוב ❤️',
    'תודה על הביקורת! נעבוד על שיפור השירות 💪'
  ];

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">אין ביקורות עדיין</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.name} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-bold text-gray-900">{review.reviewer?.displayName || 'לקוח'}</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.createTime).toLocaleDateString('he-IL')}
                </p>
              </div>
            </div>

            {review.reviewReply ? (
              <div className="bg-blue-50 rounded-lg p-4 border-r-4 border-blue-500">
                <p className="text-sm text-gray-700"><strong>התגובה שלך:</strong> {review.reviewReply.comment}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {responseTemplates.map((template, i) => (
                    <button
                      key={i}
                      onClick={() => setResponse(template)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                    >
                      {template}
                    </button>
                  ))}
                </div>
                <Textarea 
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="כתוב תגובה..."
                  rows={3}
                />
                <Button 
                  onClick={() => {
                    setSelectedReview(review);
                    handleRespond();
                  }}
                  disabled={!response || responding}
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 ml-2" />
                  {responding ? 'שולח...' : 'שלח תגובה'}
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function InsightsAnalytics({ insights }) {
  if (!insights || !insights.insights) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">אין נתונים זמינים</p>
      </div>
    );
  }

  const metrics = [
    { 
      label: 'חיפושים ישירים', 
      value: insights.QUERIES_DIRECT || 0,
      icon: <Eye className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600'
    },
    { 
      label: 'חיפושים עקיפים', 
      value: insights.QUERIES_INDIRECT || 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-400 to-purple-600'
    },
    { 
      label: 'צפיות במפות', 
      value: insights.VIEWS_MAPS || 0,
      icon: <MapPin className="w-6 h-6" />,
      color: 'from-green-400 to-green-600'
    },
    { 
      label: 'לחיצות לאתר', 
      value: insights.ACTIONS_WEBSITE || 0,
      icon: <MousePointerClick className="w-6 h-6" />,
      color: 'from-orange-400 to-orange-600'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`bg-gradient-to-r ${metric.color} rounded-xl shadow-lg p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              {metric.icon}
            </div>
            <div className="text-4xl font-bold">{metric.value}</div>
          </div>
          <h3 className="text-lg font-semibold">{metric.label}</h3>
          <p className="text-sm opacity-80">30 ימים אחרונים</p>
        </motion.div>
      ))}
    </div>
  );
}