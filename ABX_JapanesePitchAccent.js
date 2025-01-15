// 初始化 jsPsych
const jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData(); // 实验结束后显示数据
    }
});




// 启动页面：用户点击按钮以激活音频权限
var start_experiment = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2 style="text-align: center;">日本語アクセント離散度知覚実験</h2>
        <p style="text-align: left; font-size: 18px; line-height: 1.6;">
            実験へのご参加ありがとうございます。<br>
            この弁別実験の各課題では <strong>a -> b -> x</strong> という順序で 3つの音が流されて、音声の内容を見ながら<br>
            3つ目の音 (<strong>x</strong>) が以下のどちらかに似ているのかを判断してもらいます：<br>
            (a) 1つ目の音<br>
            (b) 2つ目の音<br>
        </p>
        <p style="text-align: left; font-size: 18px; line-height: 1.6;">
            回答は <strong>a</strong> または <strong>b</strong> のキーで入力してください。<br>
            静かな環境で実施し、可能な場合はイヤホンなどをご使用ください。<br>
        </p>
        <p style="text-align: center; font-size: 18px; margin-top: 20px;">
            下のボタンをクリックして実験を始めてください。
        </p>
    `,
    choices: ['実験を始めます'],
    on_finish: function() {
        // 激活 AudioContext
        const audioContext = jsPsych.pluginAPI.audioContext();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
};


var abx_audio_preload = 
abx_timeline_variable.map(function(obj){
    return [obj.SoundA, obj.SoundB, obj.SoundX];
}).flat(1);

var preload = {
    type: jsPsychPreload,
    audio: abx_audio_preload,
};



// 注意点：显示“+”
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h1 style="font-size: 50px; text-align: center;">+</h1>
    `,
    choices: "NO_KEYS",
    trial_duration: 1000 // 显示 1 秒
};

// 第一页：显示音声的内容
var display_content = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `
            <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
            音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
            </p>`;
    },
    choices: "NO_KEYS", // 不允许按键
    trial_duration: 500 // 显示 0.5 秒后自动结束
};

// 播放 A 音频
var play_sound_a = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable('SoundA'),
    choices: "NO_KEYS",
    prompt: function() {
        return `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>`},
    trial_ends_after_audio: true // 音频播放结束后自动结束
};

//delay2
var delay1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:function() {
        return `
        <p style= "white-space: nowrap;text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>`},
    choices: 'NO_KEYS',
    trial_duration: 500,
};



// 播放 B 音频
var play_sound_b = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable('SoundB'),
    choices: "NO_KEYS",
    prompt: function() {
        return `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>`},
    trial_ends_after_audio: true // 音频播放结束后自动结束
};

//delay
var delay2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:function() {
        return `
        <p style= "white-space: nowrap;text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>`},
    choices: 'NO_KEYS',
    trial_duration: 500,
};


// 播放 X 音频
var play_sound_x = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: jsPsych.timelineVariable('SoundX'),
    choices: "NO_KEYS",
    prompt: function() {
        return `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>`},
    trial_ends_after_audio: true // 音频播放结束后自动结束
};


// 第二页：提示用户进行选择
var abx_response = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」 
        </p>
        <p style="width: 100%"> 
        3番の音声は1番の音声と似たアクセントであれば<span style="background-color: yellow;">[ A ]キー</span>を、2番の音声と似たアクセントであれば <span style="background-color: yellow;">[ B ]キー</span>を<u>押してください</u>。
        </p>`},
    choices: ['a', 'b'],
    prompt: `
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
            <div style="display: inline-block; padding: 15px 25px; margin-top: 20px; border: 2px solid #007bff; border-radius: 10px; background-color: #e7f3ff; color: #007bff; font-size: 18px;">
                1番の音声と似たアクセント：[A] キー                   
            </div>
            <div style="display: inline-block; padding: 15px 25px; margin-top: 20px; border: 2px solid #007bff; border-radius: 10px; background-color: #e7f3ff; color: #007bff; font-size: 18px;">
                2番の音声と似たアクセント： [B] キー                   
            </div>
        </div>
    `,
    data: {
        phase: 'abx',
        content: jsPsych.timelineVariable('Content'), // 音声内容
        pair_type: jsPsych.timelineVariable('pair_type'),
        sound_a: jsPsych.timelineVariable('SoundA'),
        sound_b: jsPsych.timelineVariable('SoundB'),
        sound_x: jsPsych.timelineVariable('SoundX')
    }
};

// 定义 ABX 试次
var abx_trial = {
    timeline: [
        fixation,         // 注意点：+
        display_content,  // 显示音声内容
        play_sound_a,     // 播放 A 音频
        delay1,delay2,
        play_sound_b,     // 播放 B 音频
        play_sound_x,     // 播放 X 音频
        abx_response      // 提示用户选择
    ],
    timeline_variables: test_timeline_variable, // 引用试次变量
    randomize_order: true // 随机化试次顺序
};

// local save
var save_local_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <p style="width = 100%">
    実験結果データはアップロードしました。ローカルでの保存もお願いいたします。

    下のボタンを押して、実験結果のファイルを保存してください。
    </p>
    `,
    choices: ['実験結果ファイルを保存します。'],
    on_finish: function() {
        const timestamp = new Date();
        const formattedts = timestamp.toISOString().split('.')[0].replace(/[:.-]/g, '_');
        const fileName = `${formattedts}.csv`
        jsPsych.data.get().localSave('csv', fileName);
    }
};


// 实验结束页面
var ending = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2>録音はこれで終了となります。大変お疲れ様でした！</h2>
        <p>ご協力いただき、誠にありがとうございます！</p>
    `,
    choices: ['実験を終了'] // 按钮结束实验
};

// 实验时间线
var timeline = [preload, start_experiment, abx_trial, save_local_trial,ending];

// 运行实验
jsPsych.run(timeline);