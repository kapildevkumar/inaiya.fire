// data.js
const aiImg = new URL('./images/ai.png', import.meta.url).href;
const cityImg = new URL('./images/city.jpg', import.meta.url).href;
const ghibliImg = new URL('./images/ghibli.jpg', import.meta.url).href;
const giftcardImg = new URL('./images/giftcard.png', import.meta.url).href;
const indianImg = new URL('./images/indian.png', import.meta.url).href;
const natureImg = new URL('./images/nature.jpg', import.meta.url).href;
const picnicImg = new URL('./images/picnic.jpeg', import.meta.url).href;

import { db, storage } from './auth.js';
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { deepMerge } from './utils.js';
import imageCompression from 'browser-image-compression';

export let siteData = {};
export let globalError = false;

// Default JSON Structure 
function getDefaults() {
  return {
    homepage: {
      mainImage: natureImg, 
      introMessage: 'Welcome to the world I created just for you to celebrate the wonderful person you are. It is a treasure to look back at our journey, our joys, and all the moments that make our life together so special. Every day with you is a new adventure, and I cherish every moment we share together. I love you more than words can say.',
      relationshipTag: 'My Soulmate',
      relationshipStart: '2020-01-01T00:00:00.000Z'
    },
    events: [
      {
        date: '2023-09-10',
        title: 'Said "I Love You"',
        description: 'The moment I finally told you how I really felt. Best decision ever.',
        showYear: false,
        type: 'milestone'
      },
      {
        date: '2024-07-04',
        title: 'Beach Weekend',
        description: 'Watching the sunset together by the ocean. Pure magic.',
        showYear: true,
        type: 'trip'
      },
      {
        date: '2024-10-30',
        title: 'Cozy Fall Evening',
        description: 'Hot cocoa, blankets, and your favorite movie. Perfect winter night.',
        showYear: true,
        type: 'memory'
      }
    ],
    notes: [
      { date: '2025-12-15', text: 'Plan surprise dinner for anniversary' },
      { date: '2026-02-14', text: 'Book spa weekend for Valentine\'s Day' },
      { date: '2026-06-20', text: 'Research summer vacation destinations together' }
    ],
    photoGallery: [
      {
        "image": cityImg,
        "caption": "Love Proposal..."
      },
      {
        "image": natureImg,
      },
      {
        "image": picnicImg,
        "caption": "Sunday Evening..."
      },
      {
        "image": ghibliImg,
      },
      {
        "image": indianImg,
      }
    ],
    promises: {
      intro: "I'll always be there for you, through every season of life. Here are my promises to you...",
      promises: [
        'I promise to always make you laugh, even on the hardest days',
        'I promise to support your dreams and celebrate your victories',
        'I promise to always choose you, every single day'
      ]
    },
    loveReasons: {
      intro: "I could list hundreds of reasons why I love you, but here are just a few that make my heart full...",
      reasons: [
        'The way you care so deeply about everyone around you',
        'Your adventurous spirit that makes life exciting',
        'How comfortable I feel being completely myself with you'
      ]
    },
    loveLanguages: {
      intro: "They say there are many ways to say 'I love you', and this is how I speak my love to you.",
      languages: [
        {
          name: 'Words of Affirmation',
          icon: 'fas fa-comments',
          description: 'Telling you how much you mean to me, complimenting you, and expressing my love through heartfelt words and messages.'
        },
        {
          name: 'Physical Touch',
          icon: 'fas fa-hand-holding-heart',
          description: 'Holding hands, warm hugs, and gentle kisses. Physical connection that reminds us we\'re always there for each other.'
        },
        {
          name: 'Gift Giving',
          icon: 'fas fa-gift',
          description: 'Thoughtful surprises that show I\'m always thinking of you - from your favorite snack to something that reminded me of us.'
        }
      ]
    },
    bucketList: {
      intro: "The future is bright and full of possibilities. Here's what I'm dreaming of experiencing with you.",
      items: [
        {
          item: 'Go Skydiving',
          description: 'Experience the thrill of freefalling together and conquer our fears.',
          targetDate: '2026-08-15',
          icon: 'fas fa-parachute-box',
          completed: false
        },
        {
          item: 'Watch Sunrise from a Mountain',
          description: 'Hike up early and witness the world wake up from a beautiful peak.',
          targetDate: '2024-09-20',
          icon: 'fas fa-mountain-sun',
          completed: true
        },
        {
          item: 'Road Trip Across the Country',
          description: 'Take a spontaneous adventure with no strict plans, just us and the open road.',
          targetDate: '2027-06-01',
          icon: 'fas fa-road',
          completed: false
        }
      ],
    },
    memoryBook: [
      {
        date: '2023-05-14',
        message: 'Getting caught in the rain and laughing until our sides hurt. Pure joy.',
        author: 'Him'
      },
      {
        date: '2024-03-17',
        message: 'Building that bookshelf together and only arguing once. We make a great team!',
        author: 'Him'
      },
      {
        date: '2024-08-25',
        message: 'Your face when I told you I love your weird laugh - priceless and adorable.',
        author: 'Her'
      }
    ],
    playlist: {
      intro: "Some songs that make me think of you and some are the soundtracks of our love story...",
      songs: [
        {
          title: '',
          embedId: 'https://www.youtube.com/watch?v=EmsNH47y7Jo&pp=ygUZYWxsIHRpbWUgbG92ZSBzb25ncyB0YW1pbA%3D%3D',
          note: 'Reminds me of our first date'
        },
        {
          title: 'You are my everything',
          embedId: 'https://www.youtube.com/watch?v=_NhwOcq_2Bw&pp=ygUbYWxsIHRpbWUgbG92ZSBzb25ncyBlbmdsaXNo',
          note: 'Our song - reminds me of our first dance together'
        },
        {
          title: 'Make You Feel My Love',
          artist: 'Adele',
          embedId: 'https://www.youtube.com/watch?v=zeVWTY31Vn8&pp=ygUZYWxsIHRpbWUgbG92ZSBzb25ncyBoaW5kaQ%3D%3D',
          note: 'I\'d do anything to make you happy'
        }
      ]
    },
    videoMontage: {
      intro: 'A special clip of our favorite moments together, for the person who means everything to me...',
      fileId: 'https://www.youtube.com/watch?v=xdHx1YEsWwk&pp=ygUoQ2FydG9vbiByb21hbnRpYyB2aWRlb3MgZm9yIHJlbGF0aW9uc2hpcNIHCQkLCgGHKiGM7w%3D%3D'
    },
    surprise: {
      title: "You're My Everything!",
      message: "Every day with you is a gift. Thank you for being you, for loving me, and for making life so beautiful. I can't wait to create a million more memories with you. 💕",
      image: giftcardImg,
      wheelItems: ['Fancy Dinner', 'Movie Marathon', 'Couples Massage', 'Beach Picnic', 'Game Night', 'Cooking Together', 'Sunrise Hike', 'Wine Tasting']
    }
  };
}

// Load Data: Fetches both JSON content and Photos
export async function loadData() {
  try {
    const defaults = getDefaults();
    let needsInitialSave = false;

    // 1. Load JSON Content from Firestore
    const contentDocRef = doc(db, 'site_content', 'main');
    const contentDoc = await getDoc(contentDocRef);

    if (contentDoc.exists()) {
      siteData = deepMerge(defaults, contentDoc.data().content);
    } else {
      siteData = defaults;
      needsInitialSave = true;
    }

    // 2. Load Photos from Firestore
    try {
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('created_at', 'desc'));
      const photosSnapshot = await getDocs(q);
      
      siteData.photoGallery = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        image: doc.data().url,
        caption: doc.data().caption || ''
      }));
    } catch (err) {
      console.error('Error loading photos:', err);
      siteData.photoGallery = [];
    }

    siteData.SpouseName = window.SITE_CONFIG?.SpouseName || 'My Love';

    // 3. Save defaults if this is first time
    if (needsInitialSave) {
      console.log("First time load - saving default values to database");
      await saveData(true);
    }

  } catch (err) {
    console.error("Data Load Error:", err);
    globalError = true;
    window.LOAD_ERROR = true;
    throw err;
  }
}

// Save JSON Data (Everything EXCEPT photos)
export async function saveData(silent = false, showAlertFn) {
  if (globalError) {
    console.warn('Skipping save due to global error state');
    return { success: false, error: 'Global error state' };
  }

  try {
    const dataToSave = JSON.parse(JSON.stringify(siteData));
    delete dataToSave.photoGallery;
    delete dataToSave.SpouseName;
    dataToSave.lastUpdated = new Date().toISOString();

    const contentDocRef = doc(db, 'site_content', 'main');
    await setDoc(contentDocRef, { content: dataToSave }, { merge: true });

    if (!silent && showAlertFn) {
      showAlertFn("Success!", "Changes saved.", true);
    }
    return { success: true };
  } catch (err) {
    console.error('Unexpected save error:', err);
    if (showAlertFn) showAlertFn("Save Error", "An unexpected error occurred.");
    return { success: false, error: err.message };
  }
}

// --- NEW: Reset/Clear All Data Function ---
export async function resetAllData() {
  try {
    // 1. Delete all photos from storage and Firestore
    const photosRef = collection(db, 'photos');
    const photosSnapshot = await getDocs(photosRef);
    
    for (const photoDoc of photosSnapshot.docs) {
      const photoData = photoDoc.data();
      
      // Delete from Storage
      try {
        const fileName = photoData.url.split('/').pop().split('?')[0];
        const decodedFileName = decodeURIComponent(fileName);
        const storageRef = ref(storage, `media/${decodedFileName}`);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.warn('Storage cleanup warning during reset:', storageError);
      }
      
      // Delete Firestore document
      await deleteDoc(doc(db, 'photos', photoDoc.id));
    }

    // 2. Delete the main content document
    await deleteDoc(doc(db, 'site_content', 'main'));

    // 3. Clear local storage
    localStorage.removeItem('app_theme');
    localStorage.removeItem('app_edit_mode');

    return { success: true };
  } catch (error) {
    console.error("Error resetting data:", error);
    return { success: false, error: error.message };
  }
}

// --- Specialized Photo Operations ---

// Add Photo: Upload to storage, insert into Firestore, update local state
export async function addPhoto(file, caption) {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    let uploadFile = file;

    // Compress Image
    try {
      uploadFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200
      });
    } catch (e) {
      console.warn("Image compression failed, using original:", e);
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `media/${fileName}`);
    await uploadBytes(storageRef, uploadFile);

    // Get public URL
    const publicUrl = await getDownloadURL(storageRef);

    // Insert into Firestore
    const photosRef = collection(db, 'photos');
    const docRef = await addDoc(photosRef, {
      url: publicUrl,
      caption: caption || '',
      created_at: new Date()
    });

    // Update local state
    siteData.photoGallery.unshift({
      id: docRef.id,
      image: publicUrl,
      caption: caption || ''
    });

    return { success: true, data: { id: docRef.id } };
  } catch (error) {
    console.error('Error adding photo:', error);
    throw error;
  }
}

// Update Photo: Update caption in Firestore and local state
export async function updatePhoto(index, caption) {
  if (index < 0 || index >= siteData.photoGallery.length) {
    throw new Error('Invalid photo index');
  }

  const photo = siteData.photoGallery[index];
  if (!photo.id) {
    throw new Error('Photo missing database ID');
  }

  try {
    const photoDocRef = doc(db, 'photos', photo.id);
    await updateDoc(photoDocRef, {
      caption: caption || ''
    });

    // Update local state
    siteData.photoGallery[index].caption = caption || '';

    return { success: true };
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

// Delete Photo: Remove from storage, Firestore, and local state
export async function deletePhoto(index) {
  if (index < 0 || index >= siteData.photoGallery.length) {
    throw new Error('Invalid photo index');
  }

  const photo = siteData.photoGallery[index];
  if (!photo.id) {
    throw new Error('Photo missing database ID');
  }

  try {
    // 1. Delete from Storage
    try {
      const fileName = photo.image.split('/').pop().split('?')[0];
      const decodedFileName = decodeURIComponent(fileName);
      const storageRef = ref(storage, `media/${decodedFileName}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn("Could not delete from storage", e);
    }

    // 2. Delete from Firestore
    await deleteDoc(doc(db, 'photos', photo.id));

    // 3. Update Local State
    siteData.photoGallery.splice(index, 1);

    return { success: true };
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

// Upload Generic Image (for non-gallery images like homepage, surprise page, etc.)
export async function uploadGenericImage(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    let uploadFile = file;

    // Compress if library available
    if (typeof imageCompression !== 'undefined') {
      try {
        uploadFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200
        });
      } catch (e) {
        console.warn("Image compression failed, using original:", e);
      }
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const storageRef = ref(storage, `media/${fileName}`);
    await uploadBytes(storageRef, uploadFile);
    const publicUrl = await getDownloadURL(storageRef);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading generic image:', error);
    throw error;
  }
}