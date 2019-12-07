import React, { Component } from "react";
import { render, Grid, Text, Button } from "proton-native";

export default class CollTable extends Component {
  /**
   * @param props:
   * @param collection {Collection}   The data to show
   * @param columns {JS map of string}  Object with
   *    key = property name on the collection item, sets the value of the cell
   *    value = user-readable label for the column, sets the column header
   */
  constructor(props) {
    assert(typeof(props.collection) == "object", "Need Collection object");
    assert(typeof(props.columns) == "object", "Need columns");
    assert(typeof(props.onClick) == "function", "Need onClick handler");
    super(props);
    props.collection.registerObserver({
      added: async rows => this.forceUpdate(),
      removed: async rows => this.forceUpdate(),
    })
  }

  render() {
    return (
      <Grid>
        { Object.values(this.props.columns).map((label, i) =>
          <Text row="0" column={ i }>{ String(label) }</Text>
        )}
        { this.props.collection.contents.map((rowData, iRow) =>
          Object.keys(this.props.columns).map((propName, iColumn) =>
            <Button
              row={ iRow + 1 }
              column={ iColumn }
              align={{ v: true, h: false }}
              onClick={ () => this.props.onClick(rowData) }
              >
              { String(rowData[propName]) }
            </Button>
          )
        )}
      </Grid>
    );
  }
}
