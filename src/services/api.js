const API_BASE_URL = 'http://85.94.117.27:5000/api';

export const getOstaliZalihe = async (db_sid, sifra, mg_sifra_mg) => {
  try {
    const res = await fetch(`${API_BASE_URL}/ostali-market-zalihe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        db_sid,
        sifra,
        mg_sifra_mg,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Greška pri dohvatanju ostalih zaliha:', data.error);
      throw new Error(data.error || 'Greška pri dohvatu zaliha u ostalim marketima');
    }

    return data;
  } catch (err) {
    console.error('❌ Fetch greška u getOstaliZalihe:', err.message);
    throw err;
  }
};



export async function resetTempPopis(id_korisnika, id_popisa) {
  const res = await fetch(`${API_BASE_URL}/popis/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_korisnika, id_popisa }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ resetTempPopis greška:', data.error);
    throw new Error(data.error || 'Greška pri resetovanju.');
  }

  console.log(`🗑️ Obrisano ${data.rowsDeleted} unosa iz app_popis`);
  return data;
};

export async function finalSavePopis(id_korisnika, id_popisa, db_sid) {
  const res = await fetch(`${API_BASE_URL}/popis/final-save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_korisnika,
      id_popisa,
      db_sid,
    }),
  });

  const data = await res.json();
  console.log('📥 finalSavePopis odgovor:', data);

  if (!res.ok) {
    throw new Error(data.error || 'Greška pri finalnom čuvanju');
  }

  return data;
};


export const saveToTempPopis = async (id_korisnika, id_popisa, artikli) => {
  const res = await fetch(`${API_BASE_URL}/popis/temp-save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id_korisnika,
      id_popisa,
      artikli,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Greška pri snimanju u app_popis:', data.error);
    throw new Error(data.error || 'Greška pri snimanju podataka');
  }

  return data;
};


export const getZalihe = async (db_sid, mg_sifra_mg) => {
  try {
    const res = await fetch(`${API_BASE_URL}/zalihe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        db_sid,
        mg_sifra_mg,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Greška pri dohvatanju zaliha:', data.error);
      throw new Error(data.error || 'Greška pri dohvatanju zaliha');
    }

    console.log('📦 Zalihe:', data);
    return data;
  } catch (err) {
    console.error('❌ Fetch greška:', err.message);
    throw err;
  }
};


export const getMagacini = async (id_korisnika) => {
  try {
    const res = await fetch(`${API_BASE_URL}/magacini/${id_korisnika}`);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Greška pri dohvatanju magacina.');
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Neočekivan odgovor sa servera.');
    }

    return data; // niz magacina sa id_mag, naziv_mag, db_sid
  } catch (error) {
    console.error('❌ getMagacini greška:', error.message);
    throw error;
  }
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
    console.log('📤 Slanje zahteva na login:', korisnik);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnik, lozinka }),
    });

    const contentType = response.headers.get('content-type') || '';

    // Ako odgovor nije OK (npr. 404, 401, 500)
    if (!response.ok) {
      const errorBody = await response.text();
      console.log(`❌ HTTP greška ${response.status}:`, errorBody);

      // Ako je JSON, probaj parsirati
      if (contentType.includes('application/json')) {
        const jsonError = JSON.parse(errorBody);
        throw new Error(jsonError.error || `Greška ${response.status}`);
      } else {
        throw new Error(`Greška sa serverom: ${response.status}`);
      }
    }

    // Ako nije JSON, baci grešku
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.log('⚠️ Neočekivan sadržaj (nije JSON):', text);
      throw new Error('Neočekivan odgovor sa servera');
    }

    // Sve je u redu, parsiraj JSON
    const data = await response.json();
    console.log('✅ Uspešan login:', data);

    if (!data.id || !data.ime) {
      throw new Error('Nepotpuni podaci sa servera');
    }

    return {
      id: data.id,
      ime: data.ime,
    };
  } catch (error) {
    console.log('🚨 Login greška:', error.message);
    throw new Error(error.message || 'Greška pri konekciji sa serverom');
  }
}

export async function getDozvole(korisnikId) {
  const response = await fetch(`${API_BASE_URL}/dozvole/${korisnikId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Greška pri dobijanju dozvola');
  }

  // Pretvori niz u objekat po "naziv" radi lakšeg pristupa u MeniScreen
  const dozvoleMap = {};
  data.forEach(({ naziv, ind_zal, ind_sif }) => {
    dozvoleMap[naziv] = {
      ind_zal: parseInt(ind_zal, 10), // sigurnije kao broj
      ind_sif: parseInt(ind_sif, 10),
    };
  });

  return dozvoleMap;
};





export const getPopis = async (id, sifra_mg, link) => {
  const params = new URLSearchParams({
    sifra_mg,
    link,
  });

  const url = `${API_BASE_URL}/popis/${id}?${params}`;
  console.log('📡 Pozivam:', url);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('❌ API greška:', data.error);
      throw new Error(data.error || 'Greška prilikom dohvata popisa');
    }

    console.log('✅ Odgovor sa servera:', data);

    if (
      !data ||
      !Array.isArray(data.artikli_aktivni) ||
      !Array.isArray(data.artikli_sacuvani) ||
      !data.id_pop ||
      !data.dod ||
      !data.ddo
    ) {
      console.warn('⚠️ Nepotpuni podaci:', data);
      throw new Error('Nepotpuni podaci sa servera');
    }

    return {
      artikli_aktivni: data.artikli_aktivni,
      artikli_sacuvani: data.artikli_sacuvani,
      id_pop: data.id_pop,
      dod: data.dod,
      ddo: data.ddo,
    };
  } catch (err) {
    console.error('❌ Fetch greška:', err.message);
    throw err;
  }
};





