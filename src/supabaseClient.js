// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Ganti dengan kredensial dari dashboard Supabase Anda!
const supabaseUrl = "https://ofcpbxdhucqftuojabcu.supabase.co"; // Dari Settings → API
const supabaseAnonKey = "sb_publishable_XhIFHI2pNBrm38Tbs8_2Iw_jPrxaXdN"; // Dari Settings → API

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
