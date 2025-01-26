//changelog
/* 
<done>
0125
- 先随机化，然后划分成四个部分
- stimuli list: 把content改为Content，增加了Sokuon_type一列，去掉了促音50%词之前的点
- mora，content，sokuon_type在data里记录一下
- list的数据列标题和变量调用名统一一下
- 添加练习session

0126
- 刺激显示文本用####代替
- 注视点后加入一个delay，随机数750～1500



<to do>
0126
- 进度显示，用 当前trial数/总trial数 放在角落，代替当前的progress bar；（或者用更精确的进度条+百分比？）

*/



// 设置进度条
const jsPsych = initJsPsych({
    use_webaudio:false,
    show_progress_bar:true,
    auto_update_progress_bar: false, //手动设置进度条
    message_progress_bar: "完成度",
    on_finish: function(){
        jsPsych.data.displayData();
    },
});

var name_input = {
    type: jsPsychSurveyText,
    questions: [
      {prompt: `
      <div style="display: flex; align-items: center;">
        <span style="white-space: nowrap; margin-right: 10px; font-size: 30px; line-height: 1.5">お名前をローマ字で入力してください：</span>
      </div>`, placeholder: "Sophia Taro", name: 'participant_name', required: true}
    ],
    on_finish: function(data) {
      // 将姓名保存到全局数据中
      jsPsych.data.addProperties({
        participant_name: data.response.participant_name
      });
      
    }
  };


var n_trials = 262;


// 开始页面
// white-space:pre-wrap; 回车等于空行
var start_experiment = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2 style="text-align: center;">無意味単語アクセント弁別実験</h2>
        <p style="text-align: left; font-size: 18px; line-height: 1.6; "> 
        実験に参加していただき、ありがとうございます。<br>
        この弁別実験課題では a >> x >> b という順序で3つの無意味単語の音声が流れます。
        音声は画面上の「＋」記号が消えた直後に3つ連続して流れます。「＋」に注目するようにしてください。
        3つの音声を聞いて，
        2番目の音声 (x) が1番目の音声 (a) と3番目の音声 (b) のどちらに似ているかを判断してください。
        [a] または [b] のキーを押して回答してください。
        この課題は完了するまで50分程かかります。途中で休憩ポイントが3回あります。</p>　
        <p style="text-align: center; font-size: 18px; ">
        手順に慣れていただくため、10問の練習セッションをまず行います。
        よろしければ、下のボタンをクリックして練習セッションを始めてください。
        </p>
    `,
    choices: ['練習を始めます'],
    on_start: function(){
        jsPsych.setProgressBar(0)
    }, //手动设置进度条开始时间，并设定初始值为0
    on_finish: function() {
        const audioContext = jsPsych.pluginAPI.audioContext();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
};

// 预加载音频
var axb_audio_preload = axb_timeline_variable.map(function(obj){
    return [obj.SoundA, obj.SoundB, obj.SoundX];
}).flat(1);

var preload = {
    type: jsPsychPreload,
    audio: axb_audio_preload,
};

// 注意点（+）
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<h1 style="font-size: 50px; text-align: center;">+</h1>`,
    choices: "NO_KEYS",
    trial_duration: 1000
};

// 显示音声内容
var display_content = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        ＃＃＃＃
        </p>`,
    choices: "NO_KEYS",
    trial_duration: 500
};

// 播放音频
var play_sound = function(soundKey) {
    return {
        type: jsPsychAudioKeyboardResponse,
        stimulus: jsPsych.timelineVariable(soundKey),
        choices: "NO_KEYS",
        trial_ends_after_audio: true,
        prompt: `
            <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
            ＃＃＃＃ 
            </p>`,
    };
};

//delay
var delay = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:`
    <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
    ＃＃＃＃
    </p>`,
    choices: 'NO_KEYS',
    trial_duration: jsPsych.timelineVariable('delay'),
};

// 注视点后的delay；delay after fixation
var delay_random = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:`
    <p>
    </p>`,
    choices: 'NO_KEYS',
    trial_duration: Math.floor(Math.random() * (2500-500) + 1000),
};

//定义练习结束后的画面
var prac_end = {
    type: jsPsychHtmlButtonResponse,
    choices: ['実験を始めます'],
    stimulus: `
    <h1 style = "width:100%">
    練習はこれで終わりです。
    </h1>
    <p>
    この時点でご質問等ありましたら、Webページを閉じずに、実験実施者にお尋ねください。

    実験の手順に関してご質問がないようでしたら、下のボタンをクリックして本番セッションを始めてください。
    </p>
    `
};

//练习试次响应

var axb_prac_response = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        ＃＃＃＃ 
        </p>
        <p style="width: 100%"> 
        2番の音声は1番の音声とより似ていれば<span style="background-color: yellow;">[ A ]キー</span>を、
        3番の音声とより似ていれば <span style="background-color: yellow;">[ B ]キー</span>を<u>押してください</u>。
        </p>`,
    choices: ['a', 'b'],
    data: {
        phase: 'Practice',
        content: jsPsych.timelineVariable('Content'),
        mora: jsPsych.timelineVariable('Mora'),
        sokuon_type: jsPsych.timelineVariable('Sokuon_type'),
        pair_type: jsPsych.timelineVariable('Pair_type'),
        sound_a: jsPsych.timelineVariable('SoundA'),
        sound_b: jsPsych.timelineVariable('SoundB'),
        sound_x: jsPsych.timelineVariable('SoundX')
    },
    on_finish: function() {
        var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
        jsPsych.setProgressBar(curr_progress_bar_value + (1/n_trials))
    }
};


// 用户响应
var axb_response = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
        ＃＃＃＃ 
        </p>
        <p style="width: 100%"> 
        2番の音声は1番の音声と似たアクセントであれば<span style="background-color: yellow;">[ A ]キー</span>を、
        3番の音声と似たアクセントであれば <span style="background-color: yellow;">[ B ]キー</span>を<u>押してください</u>。
        </p>`,
    choices: ['a', 'b'],
    data: {
        phase: 'axb',
        content: jsPsych.timelineVariable('Content'),
        mora: jsPsych.timelineVariable('Mora'),
        sokuon_type: jsPsych.timelineVariable('Sokuon_type'),
        pair_type: jsPsych.timelineVariable('Pair_type'),
        sound_a: jsPsych.timelineVariable('SoundA'),
        sound_b: jsPsych.timelineVariable('SoundB'),
        sound_x: jsPsych.timelineVariable('SoundX')
    },
    on_finish: function() {
        var curr_progress_bar_value = jsPsych.getProgressBarCompleted();
        jsPsych.setProgressBar(curr_progress_bar_value + (1/n_trials))
    }
};

//定义练习试次

var axb_prac = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_prac_response],
    timeline_variables: prac_timeline_variable,
    randomize_order : true
};



// 定义四部分试次
var total_trials = axb_timeline_variable.length;
var quarter_trials = Math.ceil(total_trials / 4);

var axb_random_variable = shuffledList = [...axb_timeline_variable].sort(() => Math.random() - 0.5);



var axb_trial_part_1 = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(0, quarter_trials),
    randomize_order : true
};

var axb_trial_part_2 = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials, quarter_trials * 2),
    randomize_order : true
};

var axb_trial_part_3 = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials * 2, quarter_trials * 3),
    randomize_order : true
};

var axb_trial_part_4 = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials * 3),
    randomize_order : true
};

// 定义休息时间1
var breaktime1 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h1>休憩時間です！</h1>
        <p>少し休憩を取りましょう。準備ができたらボタンを押して続けてください。</p>
    `,
    choices: ['休憩完了']
};

// 定义休息时间2
var breaktime2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h1>半分終わりました！休憩時間です！</h1>
        <p>少し休憩を取りましょう。準備ができたらボタンを押して続けてください。</p>
    `,
    choices: ['休憩完了']
};

// 定义休息时间3
var breaktime3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h1>休憩時間です！</h1>
        <p>これまでの実験、いかがですか？

        大変かと思いますが、あと少しで終わります。
    
        体を動かしたり、水分補給をしたりして、少し休憩を取りましょう。
    
        準備ができたらボタンを押して続けてください。</p>
    `,
    choices: ['休憩完了']
};

// 休息结束提示
var after_break = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<h1> 実験に戻りましょう！</h1>`,
    choices: ['続けます！']
};

// 保存实验数据
var save_local_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `<p>実験結果を保存するように、以下のボタンをクリックしてください。</p>`,
    choices: ['保存'],
    on_finish: function() {
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        const fileName = `experiment_data_${timestamp}.csv`;
        jsPsych.data.get().localSave('csv', fileName);
    }
};

// 实验结束页面
var ending = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <h1 style="text-align:left; ">
    ご協力ありがとうございます。大変お疲れ様でした！
    実験はこれで終了です。
    </h1>
    <p> 
    お手数をおかけしますが、実験完了後、実験実施者にその旨をご連絡いただきますよう、お願いいたします。

    また、ご質問がございましたら、いつでもご連絡ください。
    
    ファイルを保存したと確認できたら、下のボタンを押していただいて、実験を終わります。
    </p>`,
    choices:["ファイルを保存しました。実験を終わります。"],
    response_ends_trial: true
};

// 时间线
var timeline = [
    preload,
    name_input,
    start_experiment,
    axb_prac,
    prac_end,
    axb_trial_part_1,
    breaktime1,
    after_break,
    axb_trial_part_2,
    breaktime2,
    after_break,
    axb_trial_part_3,
    breaktime3,
    after_break,
    axb_trial_part_4,
    save_local_trial,
    ending
];

// 运行实验
jsPsych.run(timeline);
