const API_BASE_URL = 'http://85.94.117.27:4999/api';


export const getZalihe = async (db_user, db_pass, db_sid, mg_sifra_mg) => {
  const res = await fetch(`${API_BASE_URL}/zalihe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      db_user,
      db_pass,
      db_sid,
      mg_sifra_mg,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Greška pri dohvatanju zaliha:', data.error);
    throw new Error(data.error || 'Greška pri dohvatanju zaliha');
  }

  return data;
};


export const getMagacini = async (id_korisnika) => {
  const res = await fetch(`${API_BASE_URL}/magacini/${id_korisnika}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Greška pri dohvatanju magacina.');
  }
  return await res.json();
};


export const updateKolicine = async (db_user, db_pass, db_sid, id_pop, artikli) => {
  const res = await fetch(`${API_BASE_URL}/popis/update-kolicine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      db_user, db_pass, db_sid, id_pop, artikli
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Greška prilikom čuvanja podataka');
  }

  return await res.json();
};

export async function login(korisnik, lozinka) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnik, lozinka }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Greška pri logovanju');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getDozvole(korisnikId) {
  const response = await fetch(`${API_BASE_URL}/dozvole/${korisnikId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Greška pri dobijanju dozvola');
  }

  return data; // niz kao ['Popis', 'Zalihe']
}
export const getPopis = async (id, db_user, db_pass, db_sid) => {
  const params = new URLSearchParams({
    db_user,
    db_pass,
    db_sid,
  });

  const url = `${API_BASE_URL}/popis/${id}?${params}`;
  console.log('📡 Pozivam:', url); // Log URL

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('❌ API greška:', data.error);
      throw new Error(data.error || 'Greška prilikom dohvata popisa');
    }

    // Loguj vraćeni rezultat
    console.log('✅ Odgovor sa servera:', data);

    if (!data || !data.zaglavlje || !Array.isArray(data.artikli)) {
      console.warn('⚠️ Nepotpuni podaci:', data);
      throw new Error('Nepotpuni podaci sa servera');
    }

    return data;

  } catch (err) {
    console.error('❌ Fetch greška:', err.message);
    throw err;
  }
};



