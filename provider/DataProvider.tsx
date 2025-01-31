'use client';

import { createContext, PropsWithChildren, useEffect, useState } from 'react';

interface Member {
  name: string;
  icon: string;
}

interface DataContextType {
  curriculum: any[];
  members: Member[];
}

const defaultContext: DataContextType = {
  curriculum: [],
  members: [],
};

export const DataContext = createContext<DataContextType>(defaultContext);

const DataProvider = ({ children }: PropsWithChildren) => {
  const [data, setData] = useState<DataContextType>(defaultContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Get member names from API
        const membersResponse = await fetch('/api/member');
        const memberNames: string[] = await membersResponse.json();

        // 2. Get member emoji from `README.mdx`
        const membersData = await Promise.all(
          memberNames.map(async (name) => {
            try {
              const readmeResponse = await fetch(`/api/member/${name}`);
              if (!readmeResponse.ok) throw new Error('README not found');

              const readmeData = await readmeResponse.json();
              const readmeText = readmeData.content || '';

              const utf8Decoder = new TextDecoder('utf-8');
              const readmeTextUtf8 = utf8Decoder.decode(new TextEncoder().encode(readmeText.normalize('NFC')));

              const emojiRegex = /\p{Extended_Pictographic}/gu;
              const iconMatch = readmeTextUtf8.match(emojiRegex);
              const icon = iconMatch ? iconMatch[0] : '';

              return { name, icon };
            } catch (error) {
              console.warn(`⚠️ Failed to fetch README for ${name}`);
              return { name, icon: '' };
            }
          })
        );

        // 3. Get curriculum data
        const curriculumResponse = await fetch('/api/curriculum');
        const curriculumData = await curriculumResponse.json();

        setData({
          curriculum: curriculumData.curriculum,
          members: membersData,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export default DataProvider;
