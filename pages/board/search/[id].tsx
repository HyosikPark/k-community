import Link from 'next/link';
import {
  SEARCH_BY_CONTENT,
  SEARCH_BY_NICKNAME,
  SEARCH_BY_TITLE,
  SEARCH_BY_TITLE_AND_CONTENT,
} from '../../../util/gqlFragment';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import SearchPosts from '../../../components/SearchPosts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';
import { menu, navMenu } from '../../../util/Menu';
import { BoardProps } from '../[id]';
import { NextWithApolloContext } from '../..';
import GeneralPost from '../../../components/GeneralPost';

interface SearchBoardProps extends BoardProps {
  option: string;
  keyword: string;
}

function pageNums(postCount: number, curPage: number): number[] {
  if (!postCount) return [1];

  let arr = [];

  const calc1 = Math.ceil(curPage / 10);
  const restPage = postCount - 150 * (calc1 - 1);
  const calc2 = Math.ceil(restPage / 15);

  let initPage = 10 * calc1 - 9;
  const lastPage = calc2 >= 10 ? initPage + 9 : initPage + calc2 - 1;

  while (initPage <= lastPage) {
    arr.push(initPage);
    initPage++;
  }

  return arr;
}

SearchBoard.getInitialProps = async (ctx: NextWithApolloContext) => {
  try {
    const { curPage, id: star, option, keyword } = ctx.query;
    const existBoard = menu.filter(
      (a) => a.names.filter((e) => e == star).length
    ).length;

    if (!existBoard) {
      if (!navMenu.includes(star as string)) throw new Error('');
    }

    const getQuery = (query) =>
      ctx.apolloClient.query({
        query,
        variables: { category: `${star}`, curPage: +curPage, value: keyword },
      });

    let result;

    if (option == 'title') {
      result = await getQuery(SEARCH_BY_TITLE).then(
        ({ data }) => data.searchByTitle
      );
    } else if (option == 'content') {
      result = await getQuery(SEARCH_BY_CONTENT).then(
        ({ data }) => data.searchByContent
      );
    } else if (option == 'title_content') {
      result = await getQuery(SEARCH_BY_TITLE_AND_CONTENT).then(
        ({ data }) => data.searchByTitleAndContent
      );
    } else if (option == 'nickname') {
      result = await getQuery(SEARCH_BY_NICKNAME).then(
        ({ data }) => data.searchByNickname
      );
    }
    return {
      ...result,
      curPage: Number(curPage),
      star,
      option,
      keyword,
    };
  } catch (e) {
    ctx.res.writeHead(302, {
      Location: `/category`,
    });
    ctx.res.end();

    return {};
  }
};

function SearchBoard({
  postInfo,
  postCount,
  curPage,
  star,
  option,
  keyword,
}: SearchBoardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const lastPage = Math.ceil(postCount / 15);

  const mobileCheck = useCallback(() => {
    if (window.innerWidth <= 767) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 767) {
      setIsMobile(true);
    }

    window.addEventListener('resize', mobileCheck);

    return () => window.removeEventListener('resize', mobileCheck);
  }, []);

  return (
    <>
      <Head>
        <title>{star} K-POP Forum - biaskpop</title>
        <meta
          name='description'
          content={`This is the ${star} fan page. Feel free to share your writing without signing up.`}
        />
        <meta property='og:title' content={`${star} K-POP Forum - biaskpop`} />
        <meta
          property='og:description'
          content={`This is the ${star} fan page. Feel free to share your writing without signing up.`}
        />
        <meta
          property='og:image'
          content='https://kpop-app-image-storage.s3.us-east-2.amazonaws.com/biaskpop.png'
        />
      </Head>
      <div className='star_container'>
        <div className='board_container'>
          {star && <h2 className='category_info'>{`${star}`}</h2>}
          <div className='sort_by_container'>
            <a href={`/board/${star}?curPage=1`}>
              <button>Latest</button>
            </a>
            <a href={`/board/hot/${star}?curPage=1`}>
              <button>Hot</button>
            </a>
            <a href={`/board/views/${star}?curPage=1`}>
              <button>Views</button>
            </a>
          </div>
          <div className='board'>
            {isMobile ? (
              <div className='board_head'>
                <h2 className='content_head'>Content</h2>
              </div>
            ) : (
              <div className='board_head'>
                <h3 className='number_head'>Number</h3>
                <h3 className='title_head'>Title</h3>
                <h3 className='nickname_head'>Nickname</h3>
                <h3 className='date_head'>Date</h3>
                <h3 className='views_head'>Views</h3>
                <h3 className='hot_head'>Hot</h3>
              </div>
            )}
            <ul className='post'>
              {postInfo.map((post) => (
                <GeneralPost post={post} key={post._id} isMobile={isMobile} />
              ))}
            </ul>
          </div>
          <div className='board_bottom'>
            <SearchPosts />
            {star == 'Notice' ? null : (
              <Link href={`/write/${star}`}>
                <button className='write_btn btn'>Write</button>
              </Link>
            )}
          </div>
          <div className='page_number_container'>
            {curPage <= 1 ? null : (
              <a
                href={`/board/search/${star}?curPage=1&option=${option}&keyword=${keyword}`}
              >
                <li id='double_left' className='angle_double_left page_button'>
                  <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </li>
              </a>
            )}
            {curPage <= 10 ? null : (
              <a
                href={
                  curPage - 10 > 1
                    ? `/board/search/${star}?curPage=${
                        curPage - 10
                      }&option=${option}&keyword=${keyword}`
                    : `/board/search/${star}?curPage=1&option=${option}&keyword=${keyword}`
                }
              >
                <li id='left' className='angle_left page_button'>
                  <FontAwesomeIcon icon={faAngleLeft} />
                </li>
              </a>
            )}

            {pageNums(postCount, curPage).map((e) => (
              <a
                key={e}
                href={`/board/search/${star}?curPage=${e}&option=${option}&keyword=${keyword}`}
              >
                <li className={`${e}page page_button`}>{e}</li>
              </a>
            ))}
            {curPage >= Math.floor((lastPage - 1) / 10) * 10 + 1 ? null : (
              <a
                href={
                  curPage + 10 > lastPage
                    ? `/board/search/${star}?curPage=${lastPage}&option=${option}&keyword=${keyword}`
                    : `/board/search/${star}?curPage=${
                        curPage + 10
                      }&option=${option}&keyword=${keyword}`
                }
              >
                <li id='right' className='angle_right page_button'>
                  <FontAwesomeIcon icon={faAngleRight} />
                </li>
              </a>
            )}

            {lastPage == curPage || postCount == 0 ? null : (
              <a
                href={`/board/search/${star}?curPage=${lastPage}&option=${option}&keyword=${keyword}`}
              >
                <li
                  id='double_right'
                  className='angle_double_right page_button'
                >
                  <FontAwesomeIcon icon={faAngleDoubleRight} />
                </li>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchBoard;
