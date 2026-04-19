// import { useEffect, useRef } from "react";

// const ParticipantVideo = ({ participant, isActive }) => {
//     const videoRef = useRef(null);

//     useEffect(() => {

//         const videoPub = Array.from(
//             participant.videoTrackPublications.values()
//         )[0];

//         const track = videoPub?.track;

//         if (track && videoRef.current) {
//             track.attach(videoRef.current);
//         }

//         return () => {
//             if (track && videoRef.current) {
//                 track.detach(videoRef.current);
//             }
//         };

//     }, [participant]);

//     return (
//         <div className={`video-wrapper ${isActive ? "active-speaker" : ""}`}>
//             <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 className="video-box"
//             />
//             <div className="name-label">
//                 {participant.identity}
//             </div>
//         </div>
//     );
// };

// export default ParticipantVideo;






















// import { useEffect, useRef } from "react";

// const ParticipantVideo = ({ participant, isActive }) => {
//     const videoRef = useRef(null);

//     useEffect(() => {

//         let track;

//         const videoPub = Array.from(
//             participant.videoTrackPublications.values()
//         ).find(pub => pub.track); // ✅ FIX

//         track = videoPub?.track;

//         if (track && videoRef.current) {
//             track.attach(videoRef.current);
//         }

//         return () => {
//             if (track && videoRef.current) {
//                 track.detach(videoRef.current);
//             }
//         };

//     }, [participant]);

//     return (
//         <div className={`video-wrapper ${isActive ? "active-speaker" : ""}`}>
//             <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 className="video-box"
//             />
//             <div className="name-label">
//                 {participant.identity}
//             </div>
//         </div>
//     );
// };

// export default ParticipantVideo;
































import { useEffect, useRef } from "react";

const ParticipantVideo = ({ participant, isActive }) => {
    const videoRef = useRef(null);

    useEffect(() => {

        let track;

        const attachTrack = () => {
            const videoPub = Array.from(
                participant.videoTrackPublications.values()
            ).find(pub => pub.track);

            track = videoPub?.track;

            if (track && videoRef.current) {
                track.attach(videoRef.current);
            }
        };

        // ✅ attach initially
        attachTrack();

        // ✅ listen for new tracks
        participant.on("trackSubscribed", attachTrack);

        return () => {
            if (track && videoRef.current) {
                track.detach(videoRef.current);
            }
            participant.off("trackSubscribed", attachTrack);
        };

    }, [participant]);

    return (
        <div className={`video-wrapper ${isActive ? "active-speaker" : ""}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                className="video-box"
            />
            <div className="name-label">
                {participant.identity}
            </div>
        </div>
    );
};

export default ParticipantVideo;