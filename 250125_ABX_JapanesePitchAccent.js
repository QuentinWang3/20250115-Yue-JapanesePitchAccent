
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
      </div>`, placeholder: "Yamada Taro", name: 'participant_name', required: true}
    ],
    on_finish: function(data) {
      // 将姓名保存到全局数据中
      jsPsych.data.addProperties({
        participant_name: data.response.participant_name
      });
      
    }
  };

// 开始页面
var start_experiment = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <h2 style="text-align: center;">日本語アクセント核弁別実験</h2>
        <p style="text-align: left; font-size: 18px; line-height: 1.6;">
        実験へのご参加ありがとうございます。<br>
            この弁別実験の各課題では <strong>a -> x -> b</strong> という順序で 3つの音が流れます。<br> 音声は常に凝視点（＋）の直後に流されますので、凝視点（＋）が提示されたら、必ずそのポイントに注目してください。<br>音声の内容を見ながら<br>
            2番目の音 (<strong>x</strong>) が以下のどちらに似ているかを判断してください：<br>
            (a) 1番目の音<br>
            (b) 3番目の音<br>
        </p>
        <p style="text-align: left; font-size: 18px; line-height: 1.6;">
            回答は <strong>a</strong> または <strong>b</strong> のキーで入力してください。<br>
            静かな環境で実施し、可能な場合はイヤホンなどをご使用ください。<br>
            この知覚実験はおおむね50分程度となり、途中で休憩ポイントが3回あります。<br>
        </p>
        <p style="text-align: center; font-size: 18px; margin-top: 20px;">
        まず実験の手順に慣れていただくように、練習を１２問準備しました。
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
    stimulus: function() {
        return `<p style="text-align: center; background-color: lightgray;">音声の内容は「<strong>${jsPsych.timelineVariable('Content')}</strong>」</p>`;
    },
    choices: "NO_KEYS",
    trial_duration: 500
};

// 播放音频
var play_sound = function(soundKey) {
    return {
        type: jsPsychAudioKeyboardResponse,
        stimulus: jsPsych.timelineVariable(soundKey),
        choices: "NO_KEYS",
        trial_ends_after_audio: true
    };
};

// 用户响应
var axb_response = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `
        <p>2番の音声は1番の音声と似たアクセントであれば[A]キーを、3番の音声と似たアクセントであれば[B]キーを押してください。</p>
        `;
    },
    choices: ['a', 'b'],
    data: {
        phase: 'axb',
        content: jsPsych.timelineVariable('Content'),
        sound_a: jsPsych.timelineVariable('SoundA'),
        sound_b: jsPsych.timelineVariable('SoundB'),
        sound_x: jsPsych.timelineVariable('SoundX')
    }
};

// 定义四部分试次
var total_trials = axb_timeline_variable.length;
var quarter_trials = Math.ceil(total_trials / 4);

var axb_trial_part_1 = {
    timeline: [fixation, display_content, play_sound('SoundA'), play_sound('SoundX'), play_sound('SoundB'), axb_response],
    timeline_variables: axb_timeline_variable.slice(0, quarter_trials)
};

var axb_trial_part_2 = {
    timeline: [fixation, display_content, play_sound('SoundA'), play_sound('SoundX'), play_sound('SoundB'), axb_response],
    timeline_variables: axb_timeline_variable.slice(quarter_trials, quarter_trials * 2)
};

var axb_trial_part_3 = {
    timeline: [fixation, display_content, play_sound('SoundA'), play_sound('SoundX'), play_sound('SoundB'), axb_response],
    timeline_variables: axb_timeline_variable.slice(quarter_trials * 2, quarter_trials * 3)
};

var axb_trial_part_4 = {
    timeline: [fixation, display_content, play_sound('SoundA'), play_sound('SoundX'), play_sound('SoundB'), axb_response],
    timeline_variables: axb_timeline_variable.slice(quarter_trials * 3)
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
