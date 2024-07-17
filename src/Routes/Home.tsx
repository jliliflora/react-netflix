import { useQuery } from "react-query";
import { getMovies, IGetMoviesResult } from "./api";
import styled from "styled-components";
import { makeImagePath } from "./utils";
import { AnimatePresence, delay, motion, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { hover } from "@testing-library/user-event/dist/hover";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
    background-color: black;
    overflow-x: hidden;
    padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto:string }>`
    height: 100vh;
    // background-color: red;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),  url(${(props) => props.bgPhoto });
    background-size: cover;
`;

const Title = styled.h2`
    font-size: 68px;
    margin-bottom: 20px;
`;

const Overview = styled.p`
    font-size: 20px;
    width: 50%; 
`;

const Slider = styled.div`
    position: relative;
    top: -100px;
`;

const Row = styled(motion.div)`
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(6, 1fr);
    margin-bottom: 10px;
    position: absolute;
    width: 100%;
`;

const Box = styled(motion.div)<{bgPhoto:string}>`
    background-color: white;
    background-image: url(${(props) => props.bgPhoto});
    background-size: cover;
    background-position: center center;
    height: 200px;
    font-size: 64px;
    cursor: pointer;
    &:first-child {
        transform-origin: center left;
    }
    &:last-child {
        transform-origin: center right;
    }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
    position: fixed; //스크롤을 내리면 오버레이가 안된 부분이 생겨서 fixed로 해줌
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
`;

const BigMovie = styled(motion.div)`
    position: absolute;
    width: 40vw;
    height: 80vh;
    left: 0;
    right: 0;
    margin: 0 auto;
`;

const rowVariants = {
    hidden: {
        x: window.outerWidth,
    },
    visible: {
        x: 0
    },
    exit: {
        x: -window.outerWidth,
    },
}

const boxVariants = {
    normal: {
        scale: 1,
    },
    hover: {
        scale: 1.25,
        y: - 50,
        transition: {
            delay: 0.3,
            duaration: 0.3,
            type: "tween",
        },
    }
}

const infoVariants = {
    hover: {
        opacity: 1,
        transition: {
            delay: 0.3,
            duaration: 0.3,
            type: "tween",
        },
    }
}

//pagenation
const offset = 6; // 한페이지에 보여주고 싶은 영화 수


function Home() {
    //useHistory 훅을 사용하면 url을 왔다갔다 할 수 있음
    const history = useHistory();

    // 내 위치가 이 route와 맞는지 알려주는 코드
    const bigMovieMatch = useRouteMatch<{ movieId: string }>("/movies/:movieId");
    // console.log(bigMovieMatch);

    const {scrollY} = useViewportScroll();

    const { data, isLoading } = useQuery<IGetMoviesResult>(
        ["movies", "nowPlaying"], getMovies
    );
    // console.log(data, isLoading);
    
    const [index, setIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const increaseIndex = () => {
        if(data) {
            if (leaving) return;
            toggleLeaving();
            const totalMovies = data.results.length - 1;
            const maxIndex = Math.floor(totalMovies / offset) - 1; //page가 0에서 시작하기 때문에 -1 해주기
            setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
        }  
    };
    const toggleLeaving = () => setLeaving((prev) => !prev);
    const onBoxClicked = (movieId: number) => {
        history.push(`/movies/${movieId}`);
    };
    const onOverlayClick = () => history.push("/");

    return (
        <Wrapper>{isLoading ? (
            <Loader>Loading...</Loader>
        ) : (
            <>
                <Banner 
                    onClick={increaseIndex}
                    bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
                >
                    <Title>{data?.results[0].title}</Title>
                    <Overview>{data?.results[0].overview}</Overview>
                </Banner>
                <Slider>
                    <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                    <Row 
                        variants={rowVariants} 
                        initial="hidden" 
                        animate="visible" 
                        exit="exit" 
                        transition={{type:"tween", duration: 1}}
                        key={index}
                    >
                        {data?.results
                            .slice(1)
                            .slice(offset * index, offset * index + offset)
                            .map((movie) => (
                                <Box
                                    layoutId={movie.id + ""}
                                    key={movie.id}
                                    whileHover="hover"
                                    initial="normal"
                                    variants={boxVariants}
                                    onClick={() => onBoxClicked(movie.id)}
                                    transition={{ type: "tween" }}
                                    bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                                    >
                                    <Info variants={infoVariants}>
                                        <h4>{movie.title}</h4>
                                    </Info>
                                </Box>
                            ))
                        }
                    </Row>
                    </AnimatePresence>
                </Slider>
                {/* 영화선택시 보이는 모달창 */}
                <AnimatePresence>
                    {bigMovieMatch ? (
                        <>
                            <Overlay 
                                onClick={onOverlayClick} 
                                exit={{opacity: 0}}
                                animate={{opacity: 1}} />
                            <BigMovie
                                style={{top: scrollY.get() + 100}} //모달 위치를 고정해주기 위해서 scrollY값 넣어줌
                                layoutId={bigMovieMatch.params.movieId}
                            />
                        </>
                    
                    ) : null}
                </AnimatePresence>
            </>
        ) }</Wrapper>
    );
}

export default Home;