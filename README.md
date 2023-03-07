## Project Description

In this project, we will create a TypeScript script that schedules the use of workstations in a room. The number of workstations and worker preferences will be read from an external configuration file, making the script more flexible and configurable.

The configuration file, `config.json`, will contain the number of workstations and the preferences of each worker. The script will read this file and generate a booking plan for a whole month, assigning each worker to a workstation or scheduling them for remote work (smart working) for each weekday.

The output will be an object containing the booking plan, where each key represents a week and each subkey represents a weekday. The values will show the workstation number or "Smart Working" if the worker is scheduled to work remotely.

To achieve this, we will define three interfaces: `Worker`, `Booking`, and `Config`, to represent the worker preferences, the booking plan, and the configuration data, respectively. We will also define some constants, such as the weekdays of the month and the number of weeks.

The script will use the `fs` module to read the configuration data from the `config.json` file and generate the booking plan accordingly. Finally, the booking plan will be logged to the console for testing purposes.

By reading the worker preferences and the number of workstations from an external configuration file, the script can be easily customized for different scenarios without modifying the source code.
