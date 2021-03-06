import React, {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { CREATEPOST, ISAUTH } from '../../util/gqlFragment';
import { useMutation } from '@apollo/client';
import Head from 'next/head';
import QuillEditor from '../../components/QuillEditor';
import { NextWithApolloContext } from '..';

Write.getInitialProps = async (ctx: NextWithApolloContext) => {
  const { id } = ctx.query;

  try {
    if (id == 'Notice') {
      await ctx.apolloClient.query({
        query: ISAUTH,
      });
    }

    return { data: 1 };
  } catch (e) {
    if (ctx.res) {
      ctx.res.writeHead(302, {
        Location: `/category`,
      });
      ctx.res.end();
    }
    return {};
  }
};

function Write() {
  const router = useRouter();
  const { id: star } = router.query;
  const submitBtn = useRef<HTMLButtonElement>(null);
  const [content, setContent] = useState('');
  const [value, setValue] = useState({
    nickname: '',
    password: '',
    title: '',
  });

  const [createPost] = useMutation(CREATEPOST, {
    variables: { ...value, content, category: `${star}` },
    onError() {
      alert('error');
      submitBtn.current.disabled = false;
      submitBtn.current.style.opacity = '1';
    },
    onCompleted(data) {
      window.location.href = `/board/${star}/${data.createPost}`;
    },
  });

  const changeValue = useCallback(
    (e: ChangeEvent<HTMLInputElement> | string) => {
      if (typeof e !== 'string')
        setValue({
          ...value,
          [e.target.name]: e.target.value,
        });
      else setContent(e);
    },
    [value]
  );

  const onSubmit = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!value.nickname) {
        return alert('Please enter your nickname.');
      }
      if (!value.password) {
        return alert('Please enter your password.');
      }
      if (!content) {
        return alert('Please enter the content.');
      }
      if (!value.title) {
        return alert('Please enter the title');
      }
      const button = e.target as HTMLButtonElement;
      button.disabled = true;
      button.style.opacity = '0.4';

      createPost();
    },
    [value, content]
  );

  const backToBoard = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const button = e.target as HTMLButtonElement;
    button.disabled = true;

    router.back();
  }, []);

  return (
    <>
      <Head>
        <link
          href='https://cdn.quilljs.com/1.3.6/quill.snow.css'
          rel='stylesheet'
        ></link>
      </Head>
      <div className='write_container'>
        <div className='write_post_container'>
          <div className='auth'>
            <input
              type='text'
              name='nickname'
              className='nickname'
              placeholder='nickname'
              value={value.nickname}
              onChange={changeValue}
              maxLength={16}
            />
            <input
              type='password'
              name='password'
              className='password'
              placeholder='password'
              value={value.password}
              onChange={changeValue}
              maxLength={20}
            />
          </div>
          <h3>You must enter a password to modify or delete the post.</h3>
          <input
            className='title'
            name='title'
            type='text'
            placeholder='Please enter a title.'
            value={value.title}
            onChange={changeValue}
            maxLength={80}
          />
          <div className='post_tool'>
            <div className='quill_editor'>
              <QuillEditor
                value={content}
                QuillChange={(e: string) => changeValue(e)}
              />
            </div>
            <div className='btn_bundle'>
              <button className='back_btn' onClick={backToBoard}>
                BACK
              </button>
              <button ref={submitBtn} className='post_btn' onClick={onSubmit}>
                POST
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Write;
