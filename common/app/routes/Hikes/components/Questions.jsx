import React, { PropTypes } from 'react';
import { spring, Motion } from 'react-motion';
import { connect } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap';
import { createSelector } from 'reselect';

import {
  answerQuestion,
  moveQuestion,
  releaseQuestion,
  grabQuestion
} from '../redux/actions';

const answerThreshold = 100;
const actionsToBind = {
  answerQuestion,
  moveQuestion,
  releaseQuestion,
  grabQuestion
};

const mapStateToProps = createSelector(
  state => state.hikesApp.hikes.entities,
  state => state.hikesApp.hikes.results,
  state => state.hikesApp.ui,
  state => state.app.isSignedIn,
  (hikesMap, hikesByDashname, ui, isSignedIn) => {
    const {
      currentQuestion = 1,
      mouse = [ 0, 0 ],
      delta = [ 0, 0 ],
      isCorrect = false,
      isPressed = false,
      shouldShakeQuestion = false
    } = ui;

    return {
      currentQuestion,
      isCorrect,
      mouse,
      delta,
      isPressed,
      shouldShakeQuestion,
      isSignedIn
    };
  }
);

class Question extends React.Component {
  static displayName = 'Questions';

  static propTypes = {
    // actions
    answerQuestion: PropTypes.func,
    releaseQuestion: PropTypes.func,
    moveQuestion: PropTypes.func,
    grabQuestion: PropTypes.func,
    // ui state
    tests: PropTypes.array,
    mouse: PropTypes.array,
    delta: PropTypes.array,
    isCorrect: PropTypes.bool,
    isPressed: PropTypes.bool,
    isSignedIn: PropTypes.bool,
    currentQuestion: PropTypes.number,
    shouldShakeQuestion: PropTypes.bool
  };

  handleMouseUp(e, answer, info) {
    e.stopPropagation();
    if (!this.props.isPressed) {
      return null;
    }

    const {
      releaseQuestion,
      answerQuestion
    } = this.props;

    releaseQuestion();
    answerQuestion({
      e,
      answer,
      info,
      threshold: answerThreshold
    });
  }

  handleMouseMove(isPressed, { delta, moveQuestion }) {
    if (!isPressed) {
      return null;
    }
    return e => moveQuestion({ e, delta });
  }

  onAnswer(answer, userAnswer, info) {
    const { isSignedIn, answerQuestion } = this.props;
    return e => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      return answerQuestion({
        answer,
        userAnswer,
        info,
        isSignedIn
      });
    };
  }

  renderQuestion(number, question, answer, shouldShakeQuestion, info) {
    const { grabQuestion, isPressed } = this.props;
    const mouseUp = e => this.handleMouseUp(e, answer, info);
    return ({ x }) => {
      const style = {
        WebkitTransform: `translate3d(${ x }px, 0, 0)`,
        transform: `translate3d(${ x }px, 0, 0)`
      };
      return (
        <article
          className={ shouldShakeQuestion ? 'animated swing shake' : '' }
          onMouseDown={ grabQuestion }
          onMouseLeave={ mouseUp }
          onMouseMove={ this.handleMouseMove(isPressed, this.props) }
          onMouseUp={ mouseUp }
          onTouchEnd={ mouseUp }
          onTouchMove={ this.handleMouseMove(isPressed, this.props) }
          onTouchStart={ grabQuestion }
          style={ style }>
          <h4>Question { number }</h4>
          <p>{ question }</p>
        </article>
      );
    };
  }

  render() {
    const {
      tests = [],
      mouse: [x],
      currentQuestion,
      shouldShakeQuestion
    } = this.props;

    const [ question, answer, info ] = tests[currentQuestion - 1] || [];
    const questionElement = this.renderQuestion(
      currentQuestion,
      question,
      answer,
      shouldShakeQuestion,
      info
    );

    return (
      <Col
        onMouseUp={ e => this.handleMouseUp(e, answer, info) }
        xs={ 8 }
        xsOffset={ 2 }>
        <Row>
          <Motion style={{ x: spring(x, { stiffness: 120, damping: 10 }) }}>
            { questionElement }
          </Motion>
          <div className='spacer' />
          <hr />
          <div>
            <Button
              bsSize='large'
              bsStyle='primary'
              className='pull-left'
              onClick={ this.onAnswer(answer, false, info) }>
              false
            </Button>
            <Button
              bsSize='large'
              bsStyle='primary'
              className='pull-right'
              onClick={ this.onAnswer(answer, true, info) }>
              true
            </Button>
          </div>
        </Row>
      </Col>
    );
  }
}

export default connect(mapStateToProps, actionsToBind)(Question);
