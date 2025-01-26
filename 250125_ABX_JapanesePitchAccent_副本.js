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


<to do>
0126
- 注视点后加入一个delay，随机数750～1500
- 进度显示，用 当前trial数/总trial数 放在角落，代替当前的progress bar；（或者用更精确的进度条+百分比？）

*/



// 设置进度条
const jsPsych = initJsPsych({
    use_webaudio:false,
    show_progress_bar:true,
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

// 开始页面
// white-space:pre-wrap; 回车等于空行
var start_experiment = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2 style="text-align: center;">日本語アクセント核弁別実験</h2>
        <p style="text-align: left; font-size: 18px; line-height: 1.6; "> 
        実験へのご参加ありがとうございます。<br>
        この弁別実験の各課題では <strong>a -> x -> b</strong> という順序で 3つの音が流れます。
        音声は常に凝視点（＋）の直後に流されますので、凝視点（＋）が提示されたら、必ずそのポイントに注目してください。
        音声の内容を見ながら，
        ２番目の音 (<strong>x</strong>) が以下のどちらに似ているかを判断してください：<br>
            (a) 1番目の音<br>
            (b) 3番目の音<br>
        回答は <strong>[a]</strong> または <strong>[b]</strong> のキーで入力してください。
        静かな環境で実施し、可能な場合はイヤホンなどをご使用ください。
        この知覚実験はおおむね50分程度となり、途中で休憩ポイントが3回あります。</p>　
        <p style="text-align: center; font-size: 18px; ">
        まず実験の手順に慣れていただくように、練習を１０問準備しました。
        準備ができましたら、 下のボタンをクリックして練習セッションを始めてください。
        </p>
    `,
    choices: ['練習を始めます'],
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
    <p style="white-space: nowrap; text-align: center; padding: 20px; background-color: lightgray;">
    random delay
    </p>`,
    choices: 'NO_KEYS',
    trial_duration: Math.floor(Math.random() * (1500-750) + 750),
};

//定义练习结束后的画面
var prac_end = {
    type: jsPsychHtmlKeyboardResponse,
    choices: ['B'],
    stimulus: `
    <h1 style = "width:100%">
    練習はこれで終わりです。
    </h1>
    <p>
    この時点でご質問等ありましたら、Webページを閉じずに、研究員にお尋ねください。

    実験の手順に関してご質問がないようでしたら、[B]キーを押すと、実験が始まります。
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
        2番の音声は1番の音声と似たアクセントであれば<span style="background-color: yellow;">[ A ]キー</span>を、
        3番の音声と似たアクセントであれば <span style="background-color: yellow;">[ B ]キー</span>を<u>押してください</u>。
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
    }
};

//定义练习试次

var axb_prac = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_prac_response],
    timeline_variables: prac_timeline_variable,
    randomize_order : true,
};



// 定义四部分试次
var total_trials = axb_timeline_variable.length;
var quarter_trials = Math.ceil(total_trials / 4);

var axb_random_variable = shuffledList = [...axb_timeline_variable].sort(() => Math.random() - 0.5);



var axb_trial_part_1 = {
    timeline: [fixation, delay_random, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(0, quarter_trials),
    randomize_order : true,
};

var axb_trial_part_2 = {
    timeline: [fixation, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials, quarter_trials * 2),
    randomize_order : true,
};

var axb_trial_part_3 = {
    timeline: [fixation, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials * 2, quarter_trials * 3),
    randomize_order : true,
};

var axb_trial_part_4 = {
    timeline: [fixation, display_content, play_sound('SoundA'), delay, play_sound('SoundX'), delay, play_sound('SoundB'), axb_response],
    timeline_variables: axb_random_variable.slice(quarter_trials * 3),
    randomize_order : true,
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
    お手数をおかけしますが、実験完了後、研究責任者にその旨をご連絡いただきますよう、お願いいたします。

    また、ご質問がございましたら、いつでもご連絡いただければ幸いです。
    
    ファイルを保存したと確認できたら、下のボタンを押していただいて、実験が終わります。
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
