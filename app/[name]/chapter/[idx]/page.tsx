'use server';

import fs from 'fs/promises';
import path from 'path';
import MdxRenderer from '@/components/MdxRenderer';

const PersonalPage = async ({
  params,
}: {
  params: Promise<{ name: string; idx: string }>;
}) => {
  const name = (await params).name;
  const idx = (await params).idx;

  const curriculumPath = path.resolve(process.cwd(), 'public', 'curriculum.json');
  const file = await fs.readFile(curriculumPath, 'utf-8');
  const { data: curriculum } = JSON.parse(file);

  const partData = curriculum[+idx - 1];

  // MDX 파일을 읽어서 내용을 반환
  const mdxContents = await Promise.all(
    partData.map(async (part: any, i: number) => {
      try {
        const filePath = path.resolve(
          process.cwd(),
          'content',
          'member',
          name,
          `chap0${idx}`,
          `${i + 1}_${part?.title?.toLowerCase()}`,
          'README.mdx'
        );
        const content = await fs.readFile(filePath, 'utf-8');
        return { title: part.title, content };
      } catch (error) {
        console.error(`⚠️ Failed to fetch README for ${name}`, error);
        return { title: part.title, content: '🚨 Failed to load content.' };
      }
    })
  );

  return mdxContents.map((content, i) => (
    <div key={content.title} className="flex gap-10 w-full max-w-[960px] mx-auto px-10">
      <div className="flex flex-col gap-2">
        <span className='text-8xl'>{partData[i].icon}</span>
        <span className='text-5xl font-extrabold'>{partData[i].title}</span>
      </div>
      <MdxRenderer mdxContents={[content]} />
    </div>
  ));
};

export default PersonalPage;
