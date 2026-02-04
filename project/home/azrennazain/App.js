import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  School,
  MonitorPlay,
  ChevronDown,
  X,
  AlertTriangle,
  Printer,
  LogIn,
  Laptop,
  Smartphone,
  Presentation,
  Wrench,
  Construction,
  Plus,
  Settings,
  PlusCircle,
  Move,
  Grid,
  List,
  ShieldAlert,
  BarChart3,
  Download,
  Megaphone,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";

// --- KONFIGURASI FIREBASE (PENTING) ---
// Kod ini direka untuk berfungsi dalam DUA keadaan:
// 1. PREVIEW: Ia akan guna 'JSON.parse(__firebase_config)' secara automatik.
// 2. LIVE/HOSTING: Ia akan guna objek yang anda isi di bawah.

const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config) // Guna config automatik untuk preview
    : {
        // --- TAMPAL CONFIG DARI FIREBASE CONSOLE ANDA DI SINI APABILA PUBLISH ---
        apiKey: "AIzaSyCI-_cThERrtsRDjZlbvzjTSD5mSWkUH8U",
        authDomain: "sjkcts-smartbook.firebaseapp.com",
        projectId: "sjkcts-smartbook",
        storageBucket: "sjkcts-smartbook.firebasestorage.app",
        messagingSenderId: "442543763051",
        appId: "1:442543763051:web:2e2604e0c7b25a490b4b2e",
      };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId =
  typeof __app_id !== "undefined" ? __app_id : "sjkc_tsi_sin_booking_v2";

// --- Constants ---
const ADMIN_PIN = "1234"; // PIN for Admin Actions
const ROOM_RESOURCE = {
  id: "pss_creative_lab",
  name: "PSS / Creative Lab",
  type: "room",
  icon: BookOpen,
};
const MAX_WEEKLY_SLOTS = 4;
const MAX_FIXED_SLOTS = 2; // Limit for PMO and RBT per class per week

const DEFAULT_ICT_ITEMS = [
  "ASUS 1",
  "ASUS 2",
  "ASUS 3",
  "HP 1",
  "HP 2",
  "HP 3",
  "HP 4",
  "HP 5",
  "HP 6",
  "HP 7",
  "HP 8",
  "HP 9",
  "HP 10",
  "HP 11",
  "HP 12",
  "SAMSUNG TAB (GREY)",
  "SAMSUNG TAB (BLUE)",
  "iBOARD",
];

const PMO_CLASSES = [
  "PMO 1K",
  "PMO 1M",
  "PMO 2",
  "PMO 3K",
  "PMO 3M",
  "PMO 4K",
  "PMO 4M",
  "PMO 5K",
  "PMO 5M",
  "PMO 6K",
  "PMO 6M",
];

const RBT_CLASSES = [
  "RBT 4K",
  "RBT 4M",
  "RBT 5K",
  "RBT 5M",
  "RBT 6K",
  "RBT 6M",
];

const ALL_TIME_SLOTS = [
  "07:20 - 07:50",
  "07:50 - 08:20",
  "08:20 - 08:50",
  "08:50 - 09:20",
  "09:20 - 09:50",
  "09:50 - 10:20",
  "10:20 - 10:40 (Rehat)",
  "10:40 - 11:10",
  "11:10 - 11:40",
  "11:40 - 12:10",
  "12:10 - 12:40",
  "12:40 - 13:10",
];

const TEACHERS = [
  "HSM",
  "LSY",
  "SPP",
  "HNJ",
  "LCN",
  "NTS",
  "RUBI",
  "SITI",
  "SHE",
  "GSP",
  "AMY",
  "HPC",
  "LYS",
  "PSN",
  "HYE",
  "CWB",
  "CFY",
  "DYG",
  "LSR",
  "AZR",
  "ONG",
  "ZAKI",
  "WSN",
  "ALB",
  "MILA",
  "WILSON",
  "AIDAH",
];

const ACADEMIC_WEEKS = [
  {
    id: 1,
    label: "Minggu 1",
    start: "2026-01-12",
    end: "2026-01-16",
    note: "Transisi / Orientasi",
  },
  {
    id: 2,
    label: "Minggu 2",
    start: "2026-01-19",
    end: "2026-01-23",
    note: "Transisi",
  },
  {
    id: 3,
    label: "Minggu 3",
    start: "2026-01-26",
    end: "2026-01-30",
    note: "Transisi / CNY Week",
  },
  {
    id: 4,
    label: "Minggu 4",
    start: "2026-02-02",
    end: "2026-02-06",
    note: "",
  },
  {
    id: 5,
    label: "Minggu 5",
    start: "2026-02-09",
    end: "2026-02-13",
    note: "PSS Operasi",
  },
  {
    id: 6,
    label: "Minggu 6",
    start: "2026-02-16",
    end: "2026-02-20",
    note: "Cuti CNY",
  },
  {
    id: 7,
    label: "Minggu 7",
    start: "2026-02-23",
    end: "2026-02-27",
    note: "Ihya' Ramadhan",
  },
  {
    id: 8,
    label: "Minggu 8",
    start: "2026-03-02",
    end: "2026-03-06",
    note: "SKPM / Matematik",
  },
  {
    id: 9,
    label: "Minggu 9",
    start: "2026-03-09",
    end: "2026-03-13",
    note: "Dialog Prestasi",
  },
  {
    id: 10,
    label: "Minggu 10",
    start: "2026-03-16",
    end: "2026-03-20",
    note: "Hari Raya",
  },
  {
    id: 11,
    label: "Minggu 11",
    start: "2026-03-30",
    end: "2026-04-03",
    note: "Good Friday (3 Apr)",
  },
  {
    id: 12,
    label: "Minggu 12",
    start: "2026-04-06",
    end: "2026-04-10",
    note: "English Week",
  },
  {
    id: 13,
    label: "Minggu 13",
    start: "2026-04-13",
    end: "2026-04-17",
    note: "Segak 1",
  },
  {
    id: 14,
    label: "Minggu 14",
    start: "2026-04-20",
    end: "2026-04-24",
    note: "Mesyuarat Bil 2",
  },
  {
    id: 15,
    label: "Minggu 15",
    start: "2026-04-27",
    end: "2026-05-01",
    note: "Ujian Pertengahan / Labour Day",
  },
  {
    id: 16,
    label: "Minggu 16",
    start: "2026-05-04",
    end: "2026-05-08",
    note: "Tulisan Cantik BC",
  },
  {
    id: 17,
    label: "Minggu 17",
    start: "2026-05-11",
    end: "2026-05-15",
    note: "Hari Guru",
  },
  {
    id: 18,
    label: "Minggu 18",
    start: "2026-05-18",
    end: "2026-05-22",
    note: "Hari Anugerah / PBD",
  },
  {
    id: 19,
    label: "Minggu 19",
    start: "2026-06-08",
    end: "2026-06-12",
    note: "Semak SPBT",
  },
  {
    id: 20,
    label: "Minggu 20",
    start: "2026-06-15",
    end: "2026-06-19",
    note: "Awal Muharram (17 Jun)",
  },
  {
    id: 21,
    label: "Minggu 21",
    start: "2026-06-22",
    end: "2026-06-26",
    note: "RBT Week",
  },
  {
    id: 22,
    label: "Minggu 22",
    start: "2026-06-29",
    end: "2026-07-03",
    note: "Semak Kerja",
  },
  {
    id: 23,
    label: "Minggu 23",
    start: "2026-07-06",
    end: "2026-07-10",
    note: "Celik Matematik",
  },
  {
    id: 24,
    label: "Minggu 24",
    start: "2026-07-13",
    end: "2026-07-17",
    note: "Semak SPBT",
  },
  {
    id: 25,
    label: "Minggu 25",
    start: "2026-07-20",
    end: "2026-07-24",
    note: "Minggu Bahasa Melayu",
  },
  {
    id: 26,
    label: "Minggu 26",
    start: "2026-07-27",
    end: "2026-07-31",
    note: "Semak Kerja",
  },
  {
    id: 27,
    label: "Minggu 27",
    start: "2026-08-03",
    end: "2026-08-07",
    note: "Mesyuarat Bil 3",
  },
  {
    id: 28,
    label: "Minggu 28",
    start: "2026-08-10",
    end: "2026-08-14",
    note: "Kurikulum Bil 3",
  },
  {
    id: 29,
    label: "Minggu 29",
    start: "2026-08-17",
    end: "2026-08-21",
    note: "Bulan Kemerdekaan",
  },
  {
    id: 30,
    label: "Minggu 30",
    start: "2026-08-24",
    end: "2026-08-28",
    note: "Maulidur Rasul",
  },
  {
    id: 31,
    label: "Minggu 31",
    start: "2026-09-07",
    end: "2026-09-11",
    note: "Buku Skrap Sejarah",
  },
  {
    id: 32,
    label: "Minggu 32",
    start: "2026-09-14",
    end: "2026-09-18",
    note: "Hari Malaysia (16 Sep)",
  },
  {
    id: 33,
    label: "Minggu 33",
    start: "2026-09-21",
    end: "2026-09-25",
    note: "English Singing",
  },
  {
    id: 34,
    label: "Minggu 34",
    start: "2026-09-28",
    end: "2026-10-02",
    note: "Ulangkaji",
  },
  {
    id: 35,
    label: "Minggu 35",
    start: "2026-10-05",
    end: "2026-10-09",
    note: "Minggu Sains",
  },
  {
    id: 36,
    label: "Minggu 36",
    start: "2026-10-12",
    end: "2026-10-16",
    note: "Segak 2",
  },
  {
    id: 37,
    label: "Minggu 37",
    start: "2026-10-19",
    end: "2026-10-23",
    note: "Mesyuarat Bil 4",
  },
  {
    id: 38,
    label: "Minggu 38",
    start: "2026-10-26",
    end: "2026-10-30",
    note: "UASA (Akhir Tahun)",
  },
  {
    id: 39,
    label: "Minggu 39",
    start: "2026-11-02",
    end: "2026-11-06",
    note: "Bercerita BC",
  },
  {
    id: 40,
    label: "Minggu 40",
    start: "2026-11-09",
    end: "2026-11-13",
    note: "Deepavali",
  },
  {
    id: 41,
    label: "Minggu 41",
    start: "2026-11-16",
    end: "2026-11-20",
    note: "Dialog Prestasi 2",
  },
  {
    id: 42,
    label: "Minggu 42",
    start: "2026-11-23",
    end: "2026-11-27",
    note: "Konvokesyen",
  },
  {
    id: 43,
    label: "Minggu 43",
    start: "2026-11-30",
    end: "2026-12-04",
    note: "Hari Anugerah",
  },
];

const formatDateShort = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
};

const getWeekDays = (startDateStr) => {
  const start = new Date(startDateStr);
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const DAY_NAMES = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"];

// --- Main Component ---
export default function SchoolBookingSystem() {
  const [user, setUser] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customIctItems, setCustomIctItems] = useState([]);
  const [notice, setNotice] = useState("");

  // UI States
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState("ROOM");
  const [roomViewType, setRoomViewType] = useState("DAILY");
  const [selectedResourceId, setSelectedResourceId] = useState(
    ROOM_RESOURCE.id
  );
  const [logoError, setLogoError] = useState(false);

  // Auth State for Admin Actions
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    slot: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bookingId: null,
  });
  const [adminModal, setAdminModal] = useState(false);
  const [pinModal, setPinModal] = useState({ isOpen: false, action: null });
  const [statsModal, setStatsModal] = useState(false);
  const [noticeModal, setNoticeModal] = useState(false);

  // Form Inputs
  const [classNameInput, setClassNameInput] = useState("");
  const [selectedTeacherInput, setSelectedTeacherInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [ictBorrowTime, setIctBorrowTime] = useState("");
  const [ictReturnTime, setIctReturnTime] = useState("");
  const [ictDamageReport, setIctDamageReport] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [noticeInput, setNoticeInput] = useState("");

  const [selectedWeekId, setSelectedWeekId] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    const found = ACADEMIC_WEEKS.find(
      (w) => w.start <= today && w.end >= today
    );
    return found ? found.id : 1;
  });

  const [selectedDate, setSelectedDate] = useState(ACADEMIC_WEEKS[0].start);

  // --- Initializers & Effects ---

  // Auth & Initial Data
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth failed:", error);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedProfile = localStorage.getItem("teacherProfile");
      if (savedProfile) {
        setTeacherProfile(JSON.parse(savedProfile));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch Bookings
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "bookings")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedBookings = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(loadedBookings);
        setLoading(false);
      },
      (error) => console.error("Firestore Error:", error)
    );
    return () => unsubscribe();
  }, [user]);

  // Fetch Custom Devices
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "ict_assets")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomIctItems(assets);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch Notice
  useEffect(() => {
    if (!user) return;
    const docRef = doc(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "system_settings",
      "notice"
    );
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setNotice(docSnap.data().text || "");
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Date with Week
  useEffect(() => {
    const week = ACADEMIC_WEEKS.find((w) => w.id === selectedWeekId);
    if (week) setSelectedDate(week.start);
  }, [selectedWeekId]);

  // Reset Resource on Tab Switch
  useEffect(() => {
    if (viewMode === "ROOM") setSelectedResourceId(ROOM_RESOURCE.id);
  }, [viewMode]);

  // --- Helpers & Computed ---

  const allIctResources = useMemo(() => {
    const defaultResources = DEFAULT_ICT_ITEMS.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: name,
      type: "ict",
      icon: name.includes("TAB")
        ? Smartphone
        : name.includes("iBOARD")
        ? Presentation
        : Laptop,
      isCustom: false,
    }));
    const customResources = customIctItems.map((item) => ({
      id: item.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      name: item.name,
      type: "ict",
      icon: item.name.toUpperCase().includes("TAB") ? Smartphone : Laptop,
      isCustom: true,
      docId: item.id,
    }));
    return [...defaultResources, ...customResources];
  }, [customIctItems]);

  const allResources = [ROOM_RESOURCE, ...allIctResources];
  const currentResource =
    allResources.find((r) => r.id === selectedResourceId) || ROOM_RESOURCE;
  const CurrentIcon = currentResource.icon;

  const currentWeekInfo = useMemo(
    () => ACADEMIC_WEEKS.find((w) => w.id === selectedWeekId),
    [selectedWeekId]
  );
  const weekDays = useMemo(
    () => (currentWeekInfo ? getWeekDays(currentWeekInfo.start) : []),
    [currentWeekInfo]
  );

  const filteredBookings = useMemo(() => {
    if (viewMode === "ROOM") {
      return bookings.filter(
        (b) => b.date === selectedDate && b.resource === ROOM_RESOURCE.id
      );
    }
    return bookings
      .filter(
        (b) =>
          b.date === selectedDate &&
          allIctResources.some((r) => r.id === b.resource)
      )
      .sort((a, b) =>
        (a.borrowTime || "00:00").localeCompare(b.borrowTime || "00:00")
      );
  }, [bookings, selectedDate, viewMode, allIctResources]);

  const dailySlots = useMemo(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    if (day === 5) return ALL_TIME_SLOTS.slice(0, 9);
    if (day === 1 || day === 2) return ALL_TIME_SLOTS.slice(0, 11);
    return ALL_TIME_SLOTS;
  }, [selectedDate]);

  const myBookings = useMemo(() => {
    if (!teacherProfile) return [];
    return bookings
      .filter((b) => b.staffId === teacherProfile.staffId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bookings, teacherProfile]);

  const currentUserWeeklyUsage = useMemo(() => {
    if (!teacherProfile) return 0;
    const weekDates = getWeekDays(selectedDate);
    return bookings.filter(
      (b) =>
        b.staffId === teacherProfile.staffId &&
        b.resource === ROOM_RESOURCE.id &&
        weekDates.includes(b.date)
    ).length;
  }, [bookings, teacherProfile, selectedDate]);

  // --- ACTIONS ---

  const selectTeacher = (code) => {
    const profile = { name: code, staffId: code };
    setTeacherProfile(profile);
    localStorage.setItem("teacherProfile", JSON.stringify(profile));
    showNotification(`Selamat datang, ${code}!`);
  };

  const handleLogout = () => {
    setTeacherProfile(null);
    localStorage.removeItem("teacherProfile");
    showNotification("Anda telah keluar.");
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const verifyPin = () => {
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      setPinModal({ isOpen: false, action: null });
      setPinInput("");

      if (pinModal.action === "ADMIN_PANEL") setAdminModal(true);
      if (pinModal.action === "EDIT_NOTICE") {
        setNoticeInput(notice);
        setNoticeModal(true);
      }
      if (pinModal.action === "DELETE_OTHER") {
        setDeleteModal({ isOpen: true, bookingId: pinModal.payload });
      }
    } else {
      alert("PIN Salah!");
      setPinInput("");
    }
  };

  const requestAdminAction = (actionType, payload = null) => {
    if (isAdmin) {
      if (actionType === "ADMIN_PANEL") setAdminModal(true);
      if (actionType === "EDIT_NOTICE") {
        setNoticeInput(notice);
        setNoticeModal(true);
      }
      if (actionType === "DELETE_OTHER") {
        setDeleteModal({ isOpen: true, bookingId: payload });
      }
    } else {
      setPinModal({ isOpen: true, action: actionType, payload });
    }
  };

  const saveNotice = async () => {
    try {
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "system_settings",
          "notice"
        ),
        {
          text: noticeInput,
          updatedAt: serverTimestamp(),
        }
      );
      setNoticeModal(false);
      showNotification("Pengumuman dikemaskini.");
    } catch (e) {
      console.error(e);
      showNotification("Gagal kemaskini.", "error");
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    if (
      allIctResources.some(
        (r) => r.name.toLowerCase() === newDeviceName.trim().toLowerCase()
      )
    ) {
      showNotification("Nama alat sudah wujud.", "error");
      return;
    }
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "ict_assets"),
        {
          name: newDeviceName.trim(),
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        }
      );
      setNewDeviceName("");
      showNotification("Alat ditambah!", "success");
    } catch (error) {
      console.error(error);
      showNotification("Gagal menambah.", "error");
    }
  };

  const handleRemoveDevice = async (docId) => {
    if (!confirm("Padam alat ini?")) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "ict_assets", docId)
      );
      showNotification("Alat dipadam.", "success");
    } catch (error) {
      console.error(error);
      showNotification("Gagal memadam.", "error");
    }
  };

  const downloadCSV = () => {
    const header = [
      "Tarikh",
      "Masa",
      "Sumber/Alat",
      "Guru",
      "Kelas/Tujuan",
      "Nota ICT",
    ];
    const rows = bookings.map((b) => {
      const rName =
        allResources.find((r) => r.id === b.resource)?.name || b.resource;
      const time = b.slot || `${b.borrowTime} - ${b.returnTime}`;
      return [
        b.date,
        `"${time}"`,
        `"${rName}"`,
        `"${b.teacherName}"`,
        `"${b.className}"`,
        `"${b.damageReport || ""}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      header.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `laporan_tempahan_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Booking & Delete Logic ---

  const initiateBooking = (
    slotOrResource,
    isIct = false,
    targetDate = null
  ) => {
    if (!user) {
      showNotification("Sila tunggu...", "error");
      return;
    }
    if (targetDate) setSelectedDate(targetDate);

    setClassNameInput("");
    setIctBorrowTime("");
    setIctReturnTime("");
    setIctDamageReport("");
    setIsMaintenance(false);
    if (!teacherProfile) setSelectedTeacherInput("");

    if (isIct) {
      setSelectedResourceId(slotOrResource);
      setBookingModal({ isOpen: true, slot: "FLEXIBLE", isIct: true });
    } else {
      setBookingModal({ isOpen: true, slot: slotOrResource, isIct: false });
    }
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    let teacherName = teacherProfile?.name;
    let staffId = teacherProfile?.staffId;

    if (!teacherProfile) {
      if (!selectedTeacherInput) {
        showNotification("Pilih Guru.", "error");
        return;
      }
      teacherName = selectedTeacherInput;
      staffId = selectedTeacherInput;
      selectTeacher(selectedTeacherInput);
    }

    if (!bookingModal.isIct && !isMaintenance) {
      const weekDays = getWeekDays(selectedDate);
      const usage = bookings.filter(
        (b) =>
          b.staffId === staffId &&
          b.resource === ROOM_RESOURCE.id &&
          weekDays.includes(b.date)
      ).length;
      if (usage >= MAX_WEEKLY_SLOTS) {
        showNotification(
          `Had ${MAX_WEEKLY_SLOTS} slot seminggu dicapai.`,
          "error"
        );
        return;
      }
    }

    let finalClass = isMaintenance ? "DALAM PENYELENGARAAN" : classNameInput;
    if (!isMaintenance && !finalClass.trim()) {
      showNotification("Masukkan kelas/tujuan.", "error");
      return;
    }

    if (bookingModal.isIct) {
      if (!ictBorrowTime || !ictReturnTime || ictBorrowTime >= ictReturnTime) {
        showNotification("Masa tidak sah.", "error");
        return;
      }
      const overlaps = bookings.some(
        (b) =>
          b.resource === selectedResourceId &&
          b.date === selectedDate &&
          ictBorrowTime < b.returnTime &&
          ictReturnTime > b.borrowTime
      );
      if (overlaps) {
        showNotification("Bertindih dengan tempahan lain.", "error");
        return;
      }
    } else {
      const taken = bookings.some(
        (b) =>
          b.resource === selectedResourceId &&
          b.date === selectedDate &&
          b.slot === bookingModal.slot
      );
      if (taken) {
        showNotification("Slot sudah ditempah.", "error");
        setBookingModal({ isOpen: false, slot: null });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const data = {
        resource: selectedResourceId,
        date: selectedDate,
        slot: bookingModal.slot,
        teacherName,
        staffId,
        className: finalClass,
        createdAt: serverTimestamp(),
        userId: user.uid,
      };
      if (bookingModal.isIct) {
        data.borrowTime = ictBorrowTime;
        data.returnTime = ictReturnTime;
        data.damageReport = ictDamageReport;
      }
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "bookings"),
        data
      );
      showNotification("Berjaya!", "success");
      setBookingModal({ isOpen: false, slot: null });
    } catch (e) {
      console.error(e);
      showNotification("Gagal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (booking) => {
    const isMine = booking.staffId === teacherProfile?.staffId;
    // Allow deleting Fixed slots (PMO/RBT) without admin PIN
    const isFixed =
      booking.className?.startsWith("PMO") ||
      booking.className?.startsWith("RBT");

    if (isMine || isFixed) {
      setDeleteModal({ isOpen: true, bookingId: booking.id });
    } else {
      requestAdminAction("DELETE_OTHER", booking.id);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.bookingId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "bookings",
          deleteModal.bookingId
        )
      );
      showNotification("Tempahan dipadam.", "success");
      setDeleteModal({ isOpen: false, bookingId: null });
    } catch (e) {
      console.error(e);
      showNotification("Gagal padam.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e, dragData) => {
    e.dataTransfer.setData("text/plain", dragData);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (e, slot, date) => {
    e.preventDefault();
    const draggedText = e.dataTransfer.getData("text/plain");
    // Ensure we are dropping a valid class name (PMO or RBT)
    if (
      !draggedText ||
      (!draggedText.startsWith("PMO") && !draggedText.startsWith("RBT"))
    )
      return;
    if (!user) return;

    const taken = bookings.some(
      (b) =>
        b.resource === ROOM_RESOURCE.id && b.date === date && b.slot === slot
    );
    if (taken) {
      showNotification("Slot penuh!", "error");
      return;
    }

    // Check Weekly Limit for Fixed Classes (PMO/RBT)
    const weekDays = getWeekDays(date);
    const classCount = bookings.filter(
      (b) =>
        b.resource === ROOM_RESOURCE.id &&
        weekDays.includes(b.date) &&
        b.className === draggedText
    ).length;

    if (classCount >= MAX_FIXED_SLOTS) {
      showNotification(
        `Had ${draggedText} dicapai (${MAX_FIXED_SLOTS} slot/minggu).`,
        "error"
      );
      return;
    }

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "bookings"),
        {
          resource: ROOM_RESOURCE.id,
          date,
          slot,
          teacherName: teacherProfile?.name || "JADUAL",
          staffId: teacherProfile?.staffId || "PMO",
          className: draggedText,
          createdAt: serverTimestamp(),
          userId: user.uid,
        }
      );
      showNotification("Jadual ditetapkan.", "success");
    } catch (e) {
      console.error(e);
    }
  };

  // --- Views ---

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans relative">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[90] px-4 py-2 rounded-lg shadow-lg text-white ${
            notification.type === "error" ? "bg-red-500" : "bg-green-500"
          } flex items-center animate-bounce`}
        >
          {notification.type === "error" ? (
            <AlertCircle className="w-5 h-5 mr-2" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* --- PIN MODAL --- */}
      {pinModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Akses Admin Diperlukan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Sila masukkan PIN untuk meneruskan.
            </p>
            <input
              type="password"
              autoFocus
              className="w-32 text-center text-2xl tracking-widest border-b-2 border-blue-500 focus:outline-none mb-6"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPinModal({ isOpen: false })}
                className="flex-1 py-2 border rounded"
              >
                Batal
              </button>
              <button
                onClick={verifyPin}
                className="flex-1 py-2 bg-blue-600 text-white rounded font-bold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTICE EDIT MODAL --- */}
      {noticeModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Kemaskini Pengumuman</h3>
            <textarea
              className="w-full border p-2 rounded h-32 mb-4"
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              placeholder="Tulis pengumuman di sini..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoticeModal(false)}
                className="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                onClick={saveNotice}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STATS MODAL --- */}
      {statsModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center">
                <BarChart3 className="mr-2" /> Statistik Tempahan
              </h3>
              <button onClick={() => setStatsModal(false)}>
                <X />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(() => {
                const total = bookings.length;
                const resourceCounts = {};
                const teacherCounts = {};
                bookings.forEach((b) => {
                  const rName =
                    allResources.find((r) => r.id === b.resource)?.name ||
                    b.resource;
                  resourceCounts[rName] = (resourceCounts[rName] || 0) + 1;
                  teacherCounts[b.teacherName] =
                    (teacherCounts[b.teacherName] || 0) + 1;
                });
                const topResources = Object.entries(resourceCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);
                const topTeachers = Object.entries(teacherCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                return (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-3">
                        Top 5 Pengguna
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {topTeachers.map(([name, count], i) => (
                          <li
                            key={name}
                            className="flex justify-between border-b border-blue-100 pb-1"
                          >
                            <span>
                              {i + 1}. {name}
                            </span>
                            <span className="font-bold">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-3">
                        Top 5 Sumber
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {topResources.map(([name, count], i) => (
                          <li
                            key={name}
                            className="flex justify-between border-b border-green-100 pb-1"
                          >
                            <span>
                              {i + 1}. {name}
                            </span>
                            <span className="font-bold">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-full text-center p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-500 uppercase text-xs">
                        Jumlah Keseluruhan Tempahan
                      </p>
                      <p className="text-4xl font-bold text-gray-800">
                        {total}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- NOTICE BAR --- */}
      {notice && (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-bold text-center flex justify-center items-center relative z-50">
          <Megaphone className="w-4 h-4 mr-2" />
          {notice}
          <button
            onClick={() => requestAdminAction("EDIT_NOTICE")}
            className="absolute right-4 p-1 hover:bg-yellow-500 rounded"
          >
            <Settings className="w-3 h-3 opacity-50" />
          </button>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* LOGO SECTION - UPDATED */}
            {!logoError ? (
              <img
                src="logo.png"
                alt="Lencana Sekolah"
                className="h-12 w-12 mr-3 object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  setLogoError(true);
                }}
              />
            ) : (
              <div className="h-12 w-12 mr-3 flex items-center justify-center bg-blue-100 rounded-full text-blue-800 border-2 border-blue-200">
                <Shield className="h-7 w-7" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none tracking-tight">
                SJKC TSI SIN
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Sistem Tempahan Bilik & ICT
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              {teacherProfile ? (
                <span className="block text-sm font-bold text-gray-900">
                  {teacherProfile.name}
                </span>
              ) : (
                <span className="block text-sm text-gray-500 italic">
                  Tetamu
                </span>
              )}
            </div>
            {teacherProfile && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                title="Keluar"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- TAB NAV --- */}
      <div className="bg-blue-800 text-white sticky top-[60px] z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setViewMode("ROOM")}
            className={`flex-1 py-3 text-sm sm:text-base font-bold text-center border-b-4 transition-colors ${
              viewMode === "ROOM"
                ? "border-yellow-400 bg-blue-900"
                : "border-transparent hover:bg-blue-700 text-blue-200"
            }`}
          >
            TEMPAHAN BILIK PSS
          </button>
          <button
            onClick={() => setViewMode("ICT")}
            className={`flex-1 py-3 text-sm sm:text-base font-bold text-center border-b-4 transition-colors ${
              viewMode === "ICT"
                ? "border-yellow-400 bg-blue-900"
                : "border-transparent hover:bg-blue-700 text-blue-200"
            }`}
          >
            TEMPAHAN ALAT ICT
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* --- CONTROLS --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4">
          {viewMode === "ROOM" && (
            <div className="flex justify-between items-center">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center text-gray-600">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  Lokasi: PSS / Creative Lab
                </span>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setRoomViewType("DAILY")}
                  className={`px-3 py-1.5 rounded text-sm font-bold flex items-center transition-all ${
                    roomViewType === "DAILY"
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-4 h-4 mr-1.5" /> Harian
                </button>
                <button
                  onClick={() => setRoomViewType("WEEKLY")}
                  className={`px-3 py-1.5 rounded text-sm font-bold flex items-center transition-all ${
                    roomViewType === "WEEKLY"
                      ? "bg-white shadow text-blue-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid className="w-4 h-4 mr-1.5" /> Mingguan
                </button>
              </div>
            </div>
          )}
          {viewMode === "ICT" && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center text-blue-800">
              <Laptop className="w-5 h-5 mr-2" />
              <span className="font-semibold">Dashboard Tempahan ICT</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between border-t border-gray-100 pt-4">
            <div className="w-full sm:flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Pilih Minggu
              </label>
              <div className="relative">
                <select
                  value={selectedWeekId}
                  onChange={(e) => setSelectedWeekId(Number(e.target.value))}
                  className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 rounded-lg bg-gray-50"
                >
                  {ACADEMIC_WEEKS.map((week) => (
                    <option key={week.id} value={week.id}>
                      {week.label} : {formatDateShort(week.start)} -{" "}
                      {formatDateShort(week.end)}{" "}
                      {week.note ? `(${week.note})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* ADMIN & TOOLS BUTTONS */}
            <div className="flex space-x-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => requestAdminAction("EDIT_NOTICE")}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 font-medium text-sm flex items-center"
              >
                <Megaphone className="w-4 h-4 mr-1.5" /> Info
              </button>
              {viewMode === "ICT" && (
                <button
                  onClick={() => requestAdminAction("ADMIN_PANEL")}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1.5" /> Urus Alat
                </button>
              )}
              <button
                onClick={() => setStatsModal(true)}
                className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" /> Statistik
              </button>
              <button
                onClick={downloadCSV}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center"
              >
                <Download className="w-4 h-4 mr-1.5" /> Excel/CSV
              </button>
              <button
                onClick={() => setTimeout(() => window.print(), 500)}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium text-sm flex items-center"
              >
                <Printer className="w-4 h-4 mr-1.5" /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        {(viewMode === "ICT" ||
          (viewMode === "ROOM" && roomViewType === "DAILY")) && (
          <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
            {weekDays.map((dateStr, index) => (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 min-w-[4.5rem] py-3 px-2 rounded-xl border-2 transition-all ${
                  selectedDate === dateStr
                    ? "border-blue-600 bg-blue-50 text-blue-700 scale-105"
                    : "bg-white text-gray-500"
                }`}
              >
                <span className="text-xs font-bold block">
                  {DAY_NAMES[index]}
                </span>
                <span className="text-lg font-bold">
                  {formatDateShort(dateStr)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-2 space-y-6">
            {viewMode === "ROOM" ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
                {/* ROOM HEADER */}
                {roomViewType === "DAILY" && (
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                      {DAY_NAMES[new Date(selectedDate).getDay() - 1]},{" "}
                      {new Date(selectedDate).toLocaleDateString("ms-MY", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                    <BookOpen className="h-8 w-8 text-blue-100" />
                  </div>
                )}

                {/* ROOM CONTENT */}
                {roomViewType === "DAILY" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dailySlots.map((slot) => {
                      const booking = filteredBookings.find(
                        (b) => b.slot === slot
                      );
                      const isFixed =
                        booking?.className?.startsWith("PMO") ||
                        booking?.className?.startsWith("RBT");
                      const isMy = booking?.staffId === teacherProfile?.staffId;
                      return (
                        <div
                          key={slot}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, slot, selectedDate)}
                          className={`relative rounded-lg border p-4 transition-all ${
                            !booking
                              ? "bg-white hover:border-blue-400"
                              : isFixed
                              ? "bg-orange-50 border-orange-200"
                              : isMy
                              ? "bg-blue-50 border-blue-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-bold text-sm text-gray-700">
                              {slot}
                            </span>
                            {!booking && (
                              <span className="text-xs bg-gray-100 px-2 rounded text-gray-500">
                                Kosong
                              </span>
                            )}
                          </div>
                          {!booking ? (
                            <button
                              onClick={() => initiateBooking(slot)}
                              className="w-full py-2 bg-blue-600 text-white rounded text-sm font-bold shadow-sm"
                            >
                              Tempah
                            </button>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-black/5">
                              <div className="font-bold text-sm text-gray-900 flex items-center">
                                <User className="w-3 h-3 mr-1" />{" "}
                                {booking.teacherName}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {booking.className}
                              </div>
                              {(isMy || isAdmin || isFixed) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(booking)}
                                  className="mt-3 w-full py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 flex justify-center items-center"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> BATAL
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs min-w-[600px]">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-gray-50 w-24">Masa</th>
                          {weekDays.map((date, i) => (
                            <th key={date} className="border p-2 bg-blue-50">
                              {DAY_NAMES[i]} <br />{" "}
                              <span className="font-normal text-gray-500">
                                {formatDateShort(date)}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ALL_TIME_SLOTS.map((slot, i) => (
                          <tr key={slot}>
                            <td className="border p-2 font-medium bg-gray-50">
                              {slot}
                            </td>
                            {weekDays.map((date, dI) => {
                              let isValid = true;
                              if (dI === 4 && i > 8) isValid = false;
                              if ((dI === 0 || dI === 1) && i > 10)
                                isValid = false;
                              if (!isValid)
                                return (
                                  <td
                                    key={date}
                                    className="border bg-gray-100"
                                  ></td>
                                );

                              const booking = bookings.find(
                                (b) =>
                                  b.resource === ROOM_RESOURCE.id &&
                                  b.date === date &&
                                  b.slot === slot
                              );
                              const isMy =
                                booking?.staffId === teacherProfile?.staffId;
                              const isFixed =
                                booking?.className?.startsWith("PMO") ||
                                booking?.className?.startsWith("RBT");

                              return (
                                <td
                                  key={date}
                                  className={`border p-1 text-center h-14 relative group ${
                                    booking
                                      ? isFixed
                                        ? "bg-orange-50"
                                        : "bg-blue-50"
                                      : "hover:bg-blue-50 cursor-pointer"
                                  }`}
                                  onClick={() =>
                                    !booking &&
                                    initiateBooking(slot, false, date)
                                  }
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, slot, date)}
                                >
                                  {booking ? (
                                    <div className="h-full flex flex-col justify-center">
                                      <div className="font-bold text-[10px]">
                                        {booking.teacherName}
                                      </div>
                                      <div className="text-[9px] text-gray-500">
                                        {booking.className}
                                      </div>
                                      {(isMy || isAdmin || isFixed) && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRequest(booking);
                                          }}
                                          className="absolute top-0 right-0 p-1 text-red-400 opacity-0 group-hover:opacity-100"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="opacity-0 group-hover:opacity-100 text-blue-400 font-bold">
                                      +
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allIctResources.map((ict) => {
                  const items = filteredBookings.filter(
                    (b) => b.resource === ict.id
                  );
                  return (
                    <div
                      key={ict.id}
                      className="bg-white rounded-xl shadow-sm border p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center font-bold text-gray-800">
                          <Laptop className="w-4 h-4 mr-2 text-blue-600" />{" "}
                          {ict.name}
                        </div>
                        <button
                          onClick={() => initiateBooking(ict.id, true)}
                          className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Tempah
                        </button>
                      </div>
                      <div className="space-y-2">
                        {items.length > 0 ? (
                          items.map((b) => (
                            <div
                              key={b.id}
                              className={`text-xs p-2 rounded border ${
                                b.className === "DALAM PENYELENGARAAN"
                                  ? "bg-gray-100"
                                  : "bg-blue-50"
                              }`}
                            >
                              <div className="flex justify-between font-bold text-gray-700">
                                <span>
                                  {b.borrowTime} - {b.returnTime}
                                </span>
                                {(b.staffId === teacherProfile?.staffId ||
                                  isAdmin) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRequest(b)}
                                    className="text-red-500"
                                  >
                                    Batal
                                  </button>
                                )}
                              </div>
                              <div className="text-gray-600">
                                {b.className === "DALAM PENYELENGARAAN"
                                  ? "PENYELENGGARAAN"
                                  : `${b.teacherName} (${b.className})`}
                              </div>
                              {b.damageReport && (
                                <div className="text-red-600 font-bold mt-1">
                                  ⚠ {b.damageReport}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-xs text-center italic py-2">
                            Tiada tempahan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            {/* PMO DRAG (Sticky Top) */}
            {viewMode === "ROOM" && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 sticky top-24 z-10 shadow-sm">
                <div className="flex items-center mb-2 font-bold text-orange-800">
                  <Move className="w-4 h-4 mr-2" /> Jadual Tetap (Drag)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...PMO_CLASSES, ...RBT_CLASSES].map((pmo) => (
                    <div
                      key={pmo}
                      draggable
                      onDragStart={(e) => handleDragStart(e, pmo)}
                      className="bg-white border border-orange-300 text-orange-900 text-[10px] font-bold py-1.5 rounded text-center cursor-grab hover:bg-orange-100"
                    >
                      {pmo}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MY BOOKINGS / LOGIN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {teacherProfile ? (
                <>
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />{" "}
                    Tempahan Saya
                  </h3>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {myBookings.length === 0 ? (
                      <p className="text-center text-gray-400 text-xs">
                        Tiada tempahan.
                      </p>
                    ) : (
                      myBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 border rounded-lg bg-gray-50 text-xs"
                        >
                          <div className="font-bold text-blue-700">
                            {b.resource}
                          </div>
                          <div>
                            {new Date(b.date).toLocaleDateString()} |{" "}
                            {b.slot || `${b.borrowTime}-${b.returnTime}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(b)}
                            className="text-red-500 mt-1 font-bold"
                          >
                            Padam
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                    <LogIn className="w-5 h-5 mr-2" /> Log Masuk
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Pilih nama untuk mengurus tempahan.
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {TEACHERS.map((t) => (
                      <button
                        key={t}
                        onClick={() => selectTeacher(t)}
                        className="py-2 border rounded text-xs font-bold hover:bg-blue-50"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- ADMIN & BOOKING MODALS (Already rendered above) --- */}
      {/* (Structure kept cleaner by rendering modals conditionally at the root level) */}

      {/* ADMIN MODAL (For managing Tools) */}
      {adminModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Urus Alat ICT
              </h3>
              <button
                onClick={() => setAdminModal(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <form
                onSubmit={handleAddDevice}
                className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tambah Alat Baru
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nama alat (Contoh: Lenovo 1)"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Tambah
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-500 uppercase">
                  Senarai Alat (Custom)
                </h4>
                {customIctItems.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    Tiada alat tambahan.
                  </p>
                ) : (
                  customIctItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleRemoveDevice(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}

                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">
                    Senarai Asal (Kekal)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_ICT_ITEMS.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Sahkan Tempahan
              </h3>
              <button
                onClick={() => setBookingModal({ isOpen: false, slot: null })}
                className="text-blue-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={confirmBooking} className="p-6">
              <div className="space-y-4">
                {/* ... (Booking Form Content identical to previous, included here for completeness) ... */}
                {/* Reuse existing booking logic structure */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Butiran Slot
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center text-blue-800 font-bold mb-1">
                      <CurrentIcon className="w-4 h-4 mr-2" />
                      {currentResource.name}
                    </div>
                    <div className="text-sm text-gray-700">
                      {new Date(selectedDate).toLocaleDateString("ms-MY", {
                        day: "numeric",
                        month: "short",
                      })}
                      {!bookingModal.isIct && ` • ${bookingModal.slot}`}
                    </div>
                  </div>
                </div>

                {!teacherProfile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Nama Guru
                    </label>
                    <select
                      required
                      value={selectedTeacherInput}
                      onChange={(e) => setSelectedTeacherInput(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg"
                    >
                      <option value="" disabled>
                        -- Sila Pilih --
                      </option>
                      {TEACHERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quota & Maintenance Toggles here */}
                {bookingModal.isIct && (
                  <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={!isMaintenance}
                        onChange={() => setIsMaintenance(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Guna Biasa
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        checked={isMaintenance}
                        onChange={() => setIsMaintenance(true)}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="ml-2 text-sm text-red-600 font-bold">
                        PENYELENGGARAAN
                      </span>
                    </label>
                  </div>
                )}

                {!isMaintenance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kelas / Tujuan
                    </label>
                    <input
                      type="text"
                      required
                      value={classNameInput}
                      onChange={(e) => setClassNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
                    />
                  </div>
                )}

                {bookingModal.isIct && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                    <h4 className="text-sm font-bold text-blue-900">
                      Masa (Wajib)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        required
                        value={ictBorrowTime}
                        onChange={(e) => setIctBorrowTime(e.target.value)}
                        className="p-2 rounded border"
                      />
                      <input
                        type="time"
                        required
                        value={ictReturnTime}
                        onChange={(e) => setIctReturnTime(e.target.value)}
                        className="p-2 rounded border"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Catatan kerosakan..."
                      value={ictDamageReport}
                      onChange={(e) => setIctDamageReport(e.target.value)}
                      className="w-full p-2 rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setBookingModal({ isOpen: false, slot: null })}
                  className="flex-1 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-bold"
                >
                  {isSubmitting ? "..." : "Sahkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Padam Tempahan?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Adakah anda pasti mahu membatalkan tempahan ini? Tindakan ini
                tidak boleh dikembalikan.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: false, bookingId: null })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Tidak
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? "Memadam..." : "Ya, Padam"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
