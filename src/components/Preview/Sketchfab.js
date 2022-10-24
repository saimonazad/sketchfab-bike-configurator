import React, { useEffect, useRef } from "react";

// import { Container } from './styles';
import "./Sketchfab.css";
import Sketchfab from "@sketchfab/viewer-api";

const textures = {
  "green-orange": {
    url: `${process.env.PUBLIC_URL}/bike/BodyPaint_ABS_BaseColor_V1.png`,
    name: "Blue",
    uid: null,
  },
  "yellow-blue": {
    url: `${process.env.PUBLIC_URL}/bike/BodyPaint_ABS_BaseColor_V2.png`,
    name: "Black",
    uid: null,
  },
  "red-purple": {
    url: `${process.env.PUBLIC_URL}/bike/BodyPaint_ABS_BaseColor_V3.png`,
    name: "Red",
    uid: null,
  },
};
export default function SketchfabGUI({ props }) {
  const ref = useRef(null);
  const [apiSkfb, setapiSkfb] = React.useState(null);

  useEffect(() => {
    if (ref?.current) {
      try {
        const model = ref?.current;
        var client = new Sketchfab("1.12.1", model);
        let uid = "d60856c9beb54e11b0d1c0f992eaf3c7";
        var _pollTime, duration;

        var timeSlider;
        var isSeeking;
        var animationsList;
        var current_anim;
        let material;
        _pollTime = function pollTime() {
          apiSkfb.getCurrentTime(function (err, time) {
            if (!isSeeking) {
              var percentage = (100 * time) / duration;
              timeSlider.value = percentage;
            }

            requestAnimationFrame(_pollTime);
          });
        };

        var pingpong = false;
        var timeFactor = 1.0;
        client.init(uid, {
          success: function success(api) {
            // apiSkfb = api;
            setapiSkfb(api);
            api.start(function () {
              api.addEventListener("viewerready", function () {
                ////////////////////////////////////////////
                // ANIMATION: WAIT FOR LOADING ////////////
                //////////////////////////////////////////
                api.getAnimations(function (err, animations) {
                  animationsList = animations;

                  if (animations.length > 0) {
                    current_anim = 0;
                    api.setCurrentAnimationByUID(animations[current_anim][0]);
                    duration = animations[current_anim][2];
                    isSeeking = false;
                    timeSlider = document.getElementById("timeSlider");

                    _pollTime();

                    timeSlider.addEventListener("change", function () {
                      isSeeking = false;
                      api.play();
                    });
                    timeSlider.addEventListener("input", function () {
                      isSeeking = true;
                      var time = (duration * timeSlider.value) / 100;
                      api.pause();
                      api.seekTo(time, function () {
                        api.play();
                      });
                    });
                  }
                });

                api.getMaterialList((err, materials) => {
                  material = materials[5]; // There's only one material in this case
                  for (const texture in textures) {
                    api.addTexture(textures[texture].url, (err, uid) => {
                      if (!err) {
                        textures[texture].uid = uid;
                      }
                    });
                  }
                });

                // document
                //   .getElementById("play")
                //   .addEventListener("click", function () {
                //     api.play();
                //   });
                // document
                //   .getElementById("pause")
                //   .addEventListener("click", function () {
                //     api.pause();
                //   });
                // document
                //   .getElementById("pingpong")
                //   .addEventListener("click", function () {
                //     pingpong = !pingpong;
                //   });

                document
                  .getElementById("previous")
                  .addEventListener("click", function () {
                    if (current_anim === 0)
                      current_anim = animationsList.length;
                    current_anim--;
                    api.setCurrentAnimationByUID(
                      animationsList[current_anim][0]
                    );
                    api.seekTo(0);
                    duration = animationsList[current_anim][2];
                  });
                document
                  .getElementById("next")
                  .addEventListener("click", function () {
                    current_anim++;
                    if (current_anim === animationsList.length)
                      current_anim = 0;
                    api.setCurrentAnimationByUID(
                      animationsList[current_anim][0]
                    );
                    api.seekTo(0);
                    duration = animationsList[current_anim][2];
                  });
                api.addEventListener("animationChange", function (a) {
                  current_anim = 0;

                  for (var i = 0; i < animationsList.length; i++) {
                    if (animationsList[i][0] === a) {
                      duration = animationsList[i][2];
                      current_anim = i;
                      break;
                    }
                  }

                  // console.log("animationChange", a);
                });
                api.addEventListener("animationEnded", function () {
                  if (pingpong) timeFactor *= -1;
                  api.setSpeed(timeFactor);
                  // console.log("animationEnded", timeFactor);
                });
                api.addEventListener("animationPlay", function () {
                  // console.log("animationPlay");
                });
                api.addEventListener("animationStop", function () {
                  // console.log("animationStop");
                }); //api.setCycleMode('all');
                ////////////////
                // ANIMATION END
                ////////////////
              });
            });
          },
          error: function onError() {
            console.log("Viewer error");
          },
          preload: 1,
        });
      } catch (error) {
        const mute = error;
      }
    }
  }, []);
  useEffect(() => {
    if (apiSkfb != null) {
      try {
        apiSkfb.getMaterialList((err, materials) => {
          if (materials?.length > 0) {
            let materialToUpdate = materials[5];
            materialToUpdate.channels.AlbedoPBR.texture.uid =
              textures[props?.config?.color].uid;
            materialToUpdate.channels.AlbedoPBR.enable = true;
            apiSkfb.setMaterial(materialToUpdate, () => {
              // console.log("Updated material.");
            });
          }
        });
      } catch (error) {
        const mute = error;
      }
      props?.checked == true ? apiSkfb.play() : apiSkfb.pause();
    }
  }, [props?.config?.color, apiSkfb, props?.checked]);

  return (
    <iframe
      ref={ref}
      className="modelViewer"
      src=""
      id="api-frame"
      allow="autoplay; fullscreen; xr-spatial-tracking"
      xr-spatial-tracking="true"
      execution-while-out-of-viewport="true"
      execution-while-not-rendered="true"
      web-share="true"
      allowFullScreen
      mozallowfullscreen="true"
      webkitallowfullscreen="true"
    />
  );
}
